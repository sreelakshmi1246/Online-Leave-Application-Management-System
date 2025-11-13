import fs from 'fs';
import User from '../models/User.js';
import { parse } from 'csv-parse';

export const bulkImportStudents = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'CSV file required' });
    const filepath = req.file.path;

    const inserted = [];
    const skipped = [];
    const errors = [];

    const parser = fs.createReadStream(filepath).pipe(parse({ columns: true, skip_empty_lines: true, trim: true }));

    for await (const record of parser) {
      try {
        // expected CSV headers: name,email,rollNo,department,program,password(optional)
        const name = record.name?.trim();
        const email = record.email?.trim();
        const rollNo = record.rollNo?.trim();
        const department = record.department?.trim();
        const program = record.program?.trim();
        const password = (record.password && record.password.trim()) || 'Student@123';

        if (!name || !email || !rollNo) {
          skipped.push({ record, reason: 'missing required fields' });
          continue;
        }

        const exists = await User.findOne({ $or: [{ email }, { rollNo }] });
        if (exists) {
          skipped.push({ record, reason: 'already exists' });
          continue;
        }

        const user = new User({
          name, email, password, role: 'student', rollNo, department, program
        });
        await user.save();
        inserted.push(user);
      } catch (err) {
        errors.push({ record, error: String(err) });
      }
    }

    // remove uploaded csv file
    try { fs.unlinkSync(filepath); } catch (e) { /* ignore */ }

    return res.json({ inserted: inserted.length, skipped: skipped.length, errors: errors.length, details: { skipped, errors } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
