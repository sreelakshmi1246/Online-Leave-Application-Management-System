'use client';
import React from 'react'
//import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  Clock3,
  Download,
  LogOut,
  User2,
  Users,
  Search,
  XCircle,
  CalendarDays,
  Filter,
  Paperclip,
} from 'lucide-react';
// shadcn/ui
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

import { toCsv, exportCsv } from '@/lib/utils';
import EmptyState from '@/components/faculty/EmptyState';
// =====================
// Seed data
// =====================
const INITIAL = [
  {
    id: 'REQ-1024',
    type: 'Casual Leave',
    status: 'pending',
    student: 'Aarav Nair',
    email: 'aarav.nair@nitc.ac.in',
    start: '2024-01-15',
    end: '2024-01-17',
    days: 3,
    reason: 'Family event and travel.',
    submittedOn: '2024-01-10',
    attachments: [],
    reviewerNote: '',
  },
  {
    id: 'REQ-1025',
    type: 'Medical Leave',
    status: 'approved',
    student: 'Diya Menon',
    email: 'diya.menon@nitc.ac.in',
    start: '2024-02-02',
    end: '2024-02-06',
    days: 5,
    reason: 'Doctor advised rest.',
    submittedOn: '2024-01-28',
    attachments: [],
    reviewerNote: 'Approved based on medical certificate.',
  },
  {
    id: 'REQ-1026',
    type: 'Duty Leave',
    status: 'pending',
    student: 'Karthik Rao',
    email: 'karthik.rao@nitc.ac.in',
    start: '2024-01-18',
    end: '2024-01-19',
    days: 2,
    reason: 'Technical fest participation.',
    submittedOn: '2024-01-12',
    attachments: [],
    reviewerNote: '',
  },
  {
    id: 'REQ-1027',
    type: 'Casual Leave',
    status: 'pending',
    student: 'Meera S',
    email: 'meera.s@nitc.ac.in',
    start: '2024-01-20',
    end: '2024-01-21',
    days: 2,
    reason: 'Out of station.',
    submittedOn: '2024-01-13',
    attachments: [],
    reviewerNote: '',
  },
];

// =====================
// Small helpers
// =====================
const STATS = (rows) => ({
  pending: rows.filter((r) => r.status === 'pending').length,
  approved: rows.filter((r) => r.status === 'approved').length,
  rejected: rows.filter((r) => r.status === 'rejected').length,
  assignedStudents: 3,
});

const StatCard = ({ icon: Icon, label, value, tone = 'default' }) => (
  <Card className="shadow-sm border-muted/40">
    <CardContent className="flex items-center justify-between py-6">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold mt-1">{value}</p>
      </div>
      <div
        className={`rounded-full p-3 ${
          tone === 'ok'
            ? 'bg-emerald-50 text-emerald-600'
            : tone === 'warn'
            ? 'bg-amber-50 text-amber-600'
            : tone === 'bad'
            ? 'bg-rose-50 text-rose-600'
            : 'bg-muted text-foreground/70'
        }`}
      >
        <Icon className="h-6 w-6" />
      </div>
    </CardContent>
  </Card>
);

const AttachmentList = ({ files }) => {
  if (!files?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {files.map((f, i) => (
        <a
          key={`${f.name}-${i}`}
          href={f.url}
          target="_blank"
          rel="noreferrer"
          className="text-xs px-2 py-1 rounded border inline-flex items-center gap-1"
        >
          <Paperclip className="h-3 w-3" /> {f.name}
        </a>
      ))}
    </div>
  );
};




// =====================
// RequestRow
// =====================
const RequestRow = ({ r, onApprove, onReject, onAttach }) => {
  const chipTone =
    r.status === 'approved'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : r.status === 'rejected'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  const fileRef = React.useRef(null);

  return (
    <Card className="border-muted/40 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`${chipTone} border`}>
            {r.type}
          </Badge>
          <Badge variant="outline" className={`${chipTone} border ml-1 capitalize`}>
            {r.status}
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          Submitted on {new Date(r.submittedOn).toLocaleDateString()}
        </span>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.student)}`}
            />
            <AvatarFallback>{r.student.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium leading-tight">{r.student}</p>
            <p className="text-muted-foreground text-xs">{r.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>
              {new Date(r.start).toLocaleDateString()} – {new Date(r.end).toLocaleDateString()} ({r.days} days)
            </span>
          </div>
          <div className="text-muted-foreground">
            Reason: <span className="text-foreground">{r.reason}</span>
          </div>
        </div>

        {/* Attachments */}
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            className="hidden"
            onChange={(e) => onAttach?.(r.id, e.target.files)}
          />
          <Button variant="outline" size="sm" className="gap-2" onClick={() => fileRef.current?.click()}>
            <Paperclip className="h-4 w-4" /> Attach file
          </Button>
        </div>
        <AttachmentList files={r.attachments} />

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => onApprove?.(r)}>Approve</Button>
          <Button size="sm" variant="destructive" onClick={() => onReject?.(r)}>
            Reject
          </Button>
          <Button size="sm" variant="outline">View details</Button>
        </div>
      </CardContent>
    </Card>
  );
};


// =====================
// Page
// =====================

export default function FacultyAdvisorDashboard() {
  const [currentUser] = React.useState({ name: 'Dr. Rajesh Kumar', email: 'rajesh@nitc.ac.in' });

  const [q, setQ] = React.useState('');
  const [type, setType] = React.useState('all');
  const [tab, setTab] = React.useState('pending');
  const [rows, setRows] = React.useState(INITIAL);

  const [dialog, setDialog] = React.useState({ open: false, mode: 'approve', row: null });
  const [note, setNote] = React.useState('');

  // Filter rows by search query and type
  const filtered = React.useMemo(() => {
    return rows
      .filter(r =>
        [r.student, r.email, r.type, r.status, r.reason, r.id]
          .join(' ')
          .toLowerCase()
          .includes(q.toLowerCase())
      )
      .filter(r => (type === 'all' ? true : r.type === type));
  }, [q, type, rows]);

  // Filter rows by tab (status)
  const tabbed = React.useMemo(() => {
    return filtered.filter(r => (tab === 'all' ? true : r.status === tab));
  }, [filtered, tab]);

  const stats = STATS(filtered);

  // Export CSV
  const handleExport = () => {
    try {
      const rowsForTab = tab === 'all' ? filtered : filtered.filter(r => r.status === tab);
      const count = exportCsv(rowsForTab);
      if (typeof window !== 'undefined') alert(`Exported ${count} row(s) to CSV`);
    } catch (e) {
      console.error('Export failed', e);
      if (typeof window !== 'undefined') alert('Export failed. See console for details.');
    }
  };

  // Open approve/reject dialog
  const openApprove = r => { setDialog({ open: true, mode: 'approve', row: r }); setNote(''); };
  const openReject = r => { setDialog({ open: true, mode: 'reject', row: r }); setNote(''); };

  // Confirm decision
  const confirmDecision = () => {
    const { row, mode } = dialog;
    if (!row) return;
    setRows(prev =>
      prev.map(r =>
        r.id === row.id ? { ...r, status: mode === 'approve' ? 'approved' : 'rejected', reviewerNote: note } : r
      )
    );
    setDialog({ open: false, mode: 'approve', row: null });
    setNote('');
  };

  // Simulated file upload
  const uploadFile = async file => ({ name: file.name, url: URL.createObjectURL(file) });

  const onAttach = async (id, fileList) => {
    if (!fileList || !fileList.length) return;
    const files = await Promise.all(Array.from(fileList).map(f => uploadFile(f)));
    setRows(prev =>
      prev.map(r => (r.id === id ? { ...r, attachments: [...(r.attachments || []), ...files] } : r))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded grid place-content-center bg-primary/10 text-primary">🎓</div>
            <div>
              <p className="text-xs text-muted-foreground leading-none">NITC Leave Management</p>
              <h1 className="text-sm font-semibold leading-none">Faculty Advisor Dashboard</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-0 rounded-full text-[10px] bg-rose-500 text-white h-4 w-4 grid place-content-center">3</span>
            </Button>

            <div className="hidden md:flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium leading-tight">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
              <Avatar className="h-9 w-9">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                />
                <AvatarFallback>{currentUser.name.split(' ').map(s => s[0]).join('')}</AvatarFallback>
              </Avatar>
            </div>

            <Button variant="outline" className="ml-2" size="sm">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-muted-foreground">Manage leave requests for your assigned students</p>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" /> Export Reports
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <StatCard icon={Clock3} label="Pending Requests" value={stats.pending} tone="warn" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} tone="ok" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <StatCard icon={XCircle} label="Rejected" value={stats.rejected} tone="bad" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <StatCard icon={Users} label="Assigned Students" value={stats.assignedStudents} />
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="border-muted/40">
          <CardContent className="py-4 grid md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search requests…"
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={type} onValueChange={v => setType(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                  <SelectItem value="Medical Leave">Medical Leave</SelectItem>
                  <SelectItem value="Duty Leave">Duty Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => { setQ(''); setType('all'); }}>Reset</Button>
              <Button size="sm">Apply</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs + list */}
        <Tabs value={tab} onValueChange={v => setTab(v)} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="pending" className="relative">
              Pending
              <span className="ml-2 text-xs rounded-full px-1.5 bg-amber-100 text-amber-700">{STATS(rows).pending}</span>
            </TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected', 'all'].map(key => (
            <TabsContent key={key} value={key} className="grid gap-4">
              {tabbed.length ? tabbed.map(r => (
                <RequestRow key={r.id} r={r} onApprove={openApprove} onReject={openReject} onAttach={onAttach} />
              )) : <EmptyState />}
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Approval/Rejection dialog */}
      <Dialog open={dialog.open} onOpenChange={open => setDialog(d => ({ ...d, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.mode === 'approve' ? 'Approve Request' : 'Reject Request'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {dialog.row ? (
                <>
                  For <span className="font-medium">{dialog.row.student}</span> — {dialog.row.type} ({dialog.row.days} days)
                </>
              ) : null}
            </p>
            <Textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={dialog.mode === 'approve' 
                ? 'Optional note to student (e.g., approved based on certificate)' 
                : 'Give a short reason so the student knows what to fix'}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false, mode: 'approve', row: null })}>Cancel</Button>
            <Button onClick={confirmDecision} className={dialog.mode === 'reject' ? 'bg-rose-600 hover:bg-rose-700' : ''}>
              {dialog.mode === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// =====================
// Empty state
// =====================

// =====================
// Empty state component
// =====================

// =====================
// Dev tests (run only in browser, non-prod)
// =====================
if (typeof window !== 'undefined' && (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production')) {
  const testRows = [
    {
      id: 'X1',
      student: 'A B',
      email: 'a@b.com',
      type: 'Medical Leave',
      status: 'pending',
      start: '2024-01-01',
      end: '2024-01-02',
      days: 2,
      reason: 'Line1\nLine2, comma',
      submittedOn: '2024-01-01',
      attachments: [],
      reviewerNote: '',
    },
  ];
  const out = toCsv(testRows);
  console.assert(!out.includes('\nLine2, comma'), 'CSV should not contain raw newlines/commas in reason');
  console.assert(out.includes('Line1 Line2  comma'), 'Newlines/commas should be replaced with spaces');
}

export { EmptyState };

