import React from 'react';
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  CheckCheck,
  MessageSquare,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';
import { useAppStore } from '../services/store';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const {
    outages,
    complaints,
    anomalies,
    staffNoteNotifications,
    resolveOutage,
    markNoteNotificationAsRead,
    markAllNoteNotificationsAsRead,
    clearNoteNotification,
  } = useAppStore();

  if (!isOpen) return null;

  const activeOutages = outages.filter((o) => !o.resolved);
  const recentComplaints = complaints.slice(0, 5);
  const recentAnomalies = anomalies.slice(0, 5);
  const unreadNotesCount = (staffNoteNotifications || []).filter((n) => !n.isRead).length;

  return (
    <div className="absolute right-4 top-16 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Campus Network & IT Alerts</h3>
        </div>
        <div className="flex items-center gap-1.5">
          {unreadNotesCount > 0 && (
            <button
              onClick={markAllNoteNotificationsAsRead}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md transition-colors"
              title="Mark all staff notes as read"
            >
              <CheckCheck className="h-3 w-3" />
              <span>Mark all read</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 space-y-4 max-h-[72vh] overflow-y-auto pr-1">
        {/* SECTION 1: CRITICAL OUTAGE ALERTS */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-rose-700 uppercase tracking-wider mb-2">
            <span>Critical Outage Alerts ({activeOutages.length})</span>
          </div>

          {activeOutages.length === 0 ? (
            <p className="text-xs text-slate-400 py-1">No active campus-wide outages reported.</p>
          ) : (
            <div className="space-y-2">
              {activeOutages.map((outage) => (
                <div
                  key={outage.id}
                  className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-rose-950 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                      {outage.locationName}
                    </span>
                    <span className="text-[10px] font-mono text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded font-bold">
                      {outage.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-rose-800">{outage.description}</p>
                  <div className="flex items-center justify-between pt-1 text-[10px] text-rose-600">
                    <span>Est. Affected: ~{outage.affectedUsersEstimate} users</span>
                    <button
                      onClick={() => resolveOutage(outage.id)}
                      className="text-rose-700 hover:text-rose-900 font-bold underline"
                    >
                      Resolve Outage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: TECHNICIAN MAINTENANCE NOTES & ACTIVITY (NEW) */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-indigo-700 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-indigo-600" />
              <span>Technician Field Notes</span>
            </span>
            {unreadNotesCount > 0 && (
              <span className="bg-indigo-600 text-white font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {unreadNotesCount} new
              </span>
            )}
          </div>

          {(staffNoteNotifications || []).length === 0 ? (
            <p className="text-xs text-slate-400 py-1">No technician maintenance notes logged yet.</p>
          ) : (
            <div className="space-y-2">
              {(staffNoteNotifications || []).slice(0, 6).map((notif) => (
                <div
                  key={notif.id}
                  className={`rounded-xl border p-3 text-xs space-y-1.5 transition-all ${
                    !notif.isRead
                      ? 'border-indigo-200 bg-indigo-50/70 shadow-sm'
                      : 'border-slate-200 bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      {!notif.isRead && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0" />
                      )}
                      <span className="font-bold text-slate-900 truncate max-w-[150px]">
                        {notif.author}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded">
                        {notif.ticketNumber}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-700 leading-snug">
                    <span className="font-semibold text-indigo-900">{notif.locationName}:</span> {notif.text}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[10px]">
                    <span className="text-slate-500">
                      {notif.statusChange ? (
                        <span className="text-amber-700 font-bold font-mono">
                          Status: {notif.statusChange}
                        </span>
                      ) : (
                        <span>Technician Update</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      {!notif.isRead && (
                        <button
                          onClick={() => markNoteNotificationAsRead(notif.id)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold underline"
                        >
                          Mark read
                        </button>
                      )}
                      <button
                        onClick={() => clearNoteNotification(notif.id)}
                        className="text-slate-400 hover:text-rose-600 font-medium"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 3: AI ANOMALY FLAGS */}
        {recentAnomalies.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider mb-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI Anomaly Flags ({recentAnomalies.length})</span>
            </div>
            <div className="space-y-2">
              {recentAnomalies.map((anom) => (
                <div
                  key={anom.id}
                  className="rounded-xl border border-purple-100 bg-purple-50/60 p-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-purple-900 font-bold">
                    <span>{anom.locationName}</span>
                    <span className="text-[10px] font-mono text-purple-700 bg-purple-100 px-1 rounded">{anom.metric}</span>
                  </div>
                  <p className="text-[11px] text-slate-700">{anom.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: RECENT SUPPORT ACTIVITY */}
        <div>
          <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Recent Support Activity
          </div>
          <div className="space-y-2">
            {recentComplaints.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate max-w-[180px]">
                    {c.locationName}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : c.status === 'In Progress'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-1">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};