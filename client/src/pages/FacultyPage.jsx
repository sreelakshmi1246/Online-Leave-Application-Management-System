'use client';
import React, { useEffect, useState, useMemo, useRef, useContext } from 'react';
import { AuthContext } from "@/context/AuthContext";

// ICONS
import {
  Bell, CheckCircle2, Clock3, Download, LogOut, Users,
  XCircle, CalendarDays, Filter, Paperclip, Search
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select, SelectTrigger, SelectContent, SelectValue, SelectItem
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { facultyLeaves, approveLeave, rejectLeave } from "@/services/leave";
import API from "@/services/api";

import EmptyState from "@/components/faculty/EmptyState";

// CSV helper
import { toCsv, exportCsv } from "@/lib/utils";

// =============
// Stats helper
// =============
const STATS = (rows) => ({
  pending: rows.filter(r => r.status === 'pending').length,
  approved: rows.filter(r => r.status === 'approved').length,
  rejected: rows.filter(r => r.status === 'rejected').length,
  assignedStudents: rows.length ? new Set(rows.map(r => r.student._id)).size : 0
});

// =============
// Small Components
// =============
const StatCard = ({ icon: Icon, label, value, tone = "default" }) => (
  <Card className="shadow-sm border-muted/40">
    <CardContent className="flex items-center justify-between py-6">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-3xl font-semibold mt-1">{value}</p>
      </div>
      <div className={`rounded-full p-3 ${
        tone === 'ok'
          ? 'bg-emerald-50 text-emerald-600'
          : tone === 'warn'
          ? 'bg-amber-50 text-amber-600'
          : tone === 'bad'
          ? 'bg-rose-50 text-rose-600'
          : 'bg-muted text-foreground/70'
      }`}>
        <Icon className="h-6 w-6" />
      </div>
    </CardContent>
  </Card>
);

const AttachmentList = ({ files }) => {
  if (!files?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {files.map((path, i) => (
        <a key={i}
           href={`${import.meta.env.VITE_API_BASE}/uploads/${path}`}
           target="_blank"
           rel="noreferrer"
           className="text-xs px-2 py-1 rounded border inline-flex items-center gap-1">
          <Paperclip className="h-3 w-3" /> {path}
        </a>
      ))}
    </div>
  );
};

// =====================
// Row Component
// =====================
const RequestRow = ({ r, onApprove, onReject }) => {
  const chipTone =
    r.status === 'approved'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : r.status === 'rejected'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-amber-50 text-amber-700 border-amber-200';

  return (
    <Card className="border-muted/40 shadow-sm">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={`${chipTone} border`}>{r.type}</Badge>
          <Badge className={`${chipTone} border ml-1 capitalize`}>{r.status}</Badge>
        </div>
        <span className="text-xs text-muted-foreground">
          Submitted on {new Date(r.createdAt).toLocaleDateString()}
        </span>
      </CardHeader>

      <CardContent className="grid gap-3 text-sm">

        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(r.student.name)}`} />
            <AvatarFallback>{r.student.name.substring(0, 2)}</AvatarFallback>
          </Avatar>

          <div>
            <p className="font-medium">{r.student.name}</p>
            <p className="text-xs text-muted-foreground">{r.student.email}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            <span>
              {new Date(r.fromDate).toLocaleDateString()} – {new Date(r.toDate).toLocaleDateString()} ({r.days} days)
            </span>
          </div>

          <div className="text-muted-foreground">
            Reason: <span className="text-foreground">{r.reason}</span>
          </div>
        </div>

        <AttachmentList files={r.attachments} />

        <div className="flex items-center gap-2">
          {r.status === "pending" && (
            <>
              <Button size="sm" onClick={() => onApprove(r)}>Approve</Button>
              <Button size="sm" variant="destructive" onClick={() => onReject(r)}>Reject</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// =====================
// MAIN PAGE
// =====================
export default function FacultyAdvisorDashboard() {
  const { logout, user } = useContext(AuthContext);
  const currentUser = user;

  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [type, setType] = useState('all');
  const [tab, setTab] = useState('pending');

  const [dialog, setDialog] = useState({ open: false, mode: 'approve', row: null });
  const [note, setNote] = useState('');

  // Load faculty leaves from backend
  async function loadLeaves() {
    try {
      const res = await facultyLeaves(tab === "all" ? undefined : tab);
      setRows(res.data);
    } catch (err) {
      console.error("Failed to load faculty leaves:", err);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, [tab]);

  const filtered = useMemo(() => {
    return rows.filter(r =>
      [r.student?.name, r.student?.email, r.type, r.status, r.reason]
        .join(' ')
        .toLowerCase()
        .includes(q.toLowerCase())
    ).filter(r => (type === "all" ? true : r.type === type));
  }, [q, type, rows]);

  const stats = STATS(filtered);

  // CSV Export
  const handleExport = () => {
    exportCsv(filtered);
  };

  // Approve/Reject actions
  const openApprove = r => setDialog({ open: true, mode: 'approve', row: r });
  const openReject = r => setDialog({ open: true, mode: 'reject', row: r });

  const confirmDecision = async () => {
    const { row, mode } = dialog;
    if (!row) return;

    try {
      if (mode === "approve") await approveLeave(row._id, note);
      else await rejectLeave(row._id, note);

      setDialog({ open: false, row: null });
      loadLeaves();
    } catch (err) {
      console.error(err);
      alert("Action failed");
    }
  };

  return (
    <div className="min-h-screen bg-muted/20">
      {/* HEADER */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="text-primary font-semibold">🎓 Faculty Dashboard</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">{currentUser?.name}</p>
              <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
            </div>

            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Clock3} label="Pending" value={stats.pending} tone="warn" />
          <StatCard icon={CheckCircle2} label="Approved" value={stats.approved} tone="ok" />
          <StatCard icon={XCircle} label="Rejected" value={stats.rejected} tone="bad" />
          <StatCard icon={Users} label="Assigned Students" value={stats.assignedStudents} />
        </div>

        {/* Filter bar */}
        <Card>
          <CardContent className="py-4 grid md:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search leaves…"
                className="pl-9"
                value={q}
                onChange={e => setQ(e.target.value)}
              />
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={type} onValueChange={v => setType(v)}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="medical">Medical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset */}
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setQ(''); setType('all'); }}>Reset</Button>
              <Button size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-2" /> Export</Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid gap-4">
                {filtered.map(r => (
                  <RequestRow
                    key={r._id}
                    r={r}
                    onApprove={openApprove}
                    onReject={openReject}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Approval modal */}
      <Dialog open={dialog.open} onOpenChange={o => setDialog({ open: o, row: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog.mode === 'approve' ? 'Approve Leave' : 'Reject Leave'}</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground mb-2">
            {dialog.row ? (
              <>For <strong>{dialog.row.student.name}</strong> — {dialog.row.type} ({dialog.row.days} days)</>
            ) : null}
          </p>

          <Textarea
            placeholder={dialog.mode === 'approve' ? "Optional remarks" : "Reason for rejection"}
            value={note}
            onChange={e => setNote(e.target.value)}
          />

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false, row: null })}>Cancel</Button>
            <Button
              onClick={confirmDecision}
              className={dialog.mode === 'reject' ? "bg-rose-600 hover:bg-rose-700" : ""}
            >
              {dialog.mode === 'approve' ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
