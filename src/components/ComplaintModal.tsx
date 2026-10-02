import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  FileText,
  Sparkles,
  WifiOff,
  X,
} from 'lucide-react';
import { useAppStore } from '../services/store';
import { ComplaintCategory, PriorityLevel, SpeedTestResult } from '../types';
import { classifyComplaintText } from '../services/aiAnalyticsEngine';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTestSnapshot?: SpeedTestResult | null;
}

const CATEGORIES: ComplaintCategory[] = [
  'Slow Internet',
  'No Internet',
  'Frequent Disconnection',
  'High Ping',
  'Weak Signal',
  'Website / Service Unavailable',
  'Other',
];

export const ComplaintModal: React.FC<ComplaintModalProps> = ({
  isOpen,
  onClose,
  initialTestSnapshot,
}) => {
  const { locations, currentUser, selectedLocationId, submitComplaint, speedTests } = useAppStore();

  const [locationId, setLocationId] = useState<string>(
    initialTestSnapshot?.locationId || selectedLocationId || locations[0]?.id || ''
  );
  const [category, setCategory] = useState<ComplaintCategory>('Slow Internet');
  const [description, setDescription] = useState<string>('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [attachSpeedTest, setAttachSpeedTest] = useState<boolean>(true);
  const [selectedTestId, setSelectedTestId] = useState<string>(initialTestSnapshot?.id || '');
  const [aiClassification, setAiClassification] = useState<{
    suggestedCategory: ComplaintCategory;
    priority: PriorityLevel;
    confidence: number;
    extractedKeywords: string[];
  } | null>(null);

  useEffect(() => {
    if (initialTestSnapshot) {
      setLocationId(initialTestSnapshot.locationId);
      setSelectedTestId(initialTestSnapshot.id);
      if (initialTestSnapshot.healthStatus === 'Critical' || initialTestSnapshot.healthStatus === 'Poor') {
        setCategory(initialTestSnapshot.downloadSpeed < 2 ? 'No Internet' : 'Slow Internet');
        setPriority('High');
      }
    }
  }, [initialTestSnapshot]);

  useEffect(() => {
    if (description.trim().length > 10) {
      const result = classifyComplaintText(description);
      setAiClassification(result);
    } else {
      setAiClassification(null);
    }
  }, [description]);

  if (!isOpen) return null;

  const targetLocation = locations.find((l) => l.id === locationId) || locations[0];
  const relevantTests = speedTests.filter((t) => t.locationId === locationId);
  const activeTestToAttach =
    speedTests.find((t) => t.id === selectedTestId) || (relevantTests.length > 0 ? relevantTests[0] : null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !targetLocation) return;

    submitComplaint({
      userId: currentUser?.id || 'guest-user',
      userName: currentUser?.name || 'Anonymous Student',
      userEmail: currentUser?.email || 'student@campus.edu',
      locationId: targetLocation.id,
      locationName: targetLocation.name,
      building: targetLocation.building,
      category: category,
      description: description.trim(),
      relatedTestId: attachSpeedTest && activeTestToAttach ? activeTestToAttach.id : undefined,
      testSnapshot:
        attachSpeedTest && activeTestToAttach
          ? {
              downloadSpeed: activeTestToAttach.downloadSpeed,
              uploadSpeed: activeTestToAttach.uploadSpeed,
              ping: activeTestToAttach.ping,
              packetLoss: activeTestToAttach.packetLoss,
              healthScore: activeTestToAttach.healthScore,
            }
          : undefined,
      priority: priority,
      aiSuggestedCategory: aiClassification?.suggestedCategory,
      aiConfidence: aiClassification?.confidence,
    });

    onClose();
    setDescription('');
  };

  const applyAiSuggestion = () => {
    if (aiClassification) {
      setCategory(aiClassification.suggestedCategory);
      setPriority(aiClassification.priority);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <WifiOff className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Report Wi-Fi Issue</h2>
              <p className="text-xs text-slate-500">
                Submit an IT ticket with live speed metrics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Campus Location
            </label>
            <select
              value={locationId}
              onChange={(e) => {
                setLocationId(e.target.value);
                setSelectedTestId('');
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} &bull; {loc.building}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Urgency Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 font-medium focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
              >
                <option value="Low">Low (General Inquiry)</option>
                <option value="Medium">Medium (Affecting Browsing)</option>
                <option value="High">High (Affecting Study / Class)</option>
                <option value="Critical">Critical (Lab Exam / Outage)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Describe the Problem
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Wi-Fi disconnects every few minutes in Lab 2 and speed drops during lectures..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none shadow-sm"
            />
          </div>

          {aiClassification && (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-indigo-900">
                <Sparkles className="h-4 w-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="font-bold text-indigo-950">AI Suggestion:</span> Classify as{' '}
                  <span className="font-bold text-indigo-700">"{aiClassification.suggestedCategory}"</span> ({Math.round(aiClassification.confidence * 100)}% match)
                </div>
              </div>
              {category !== aiClassification.suggestedCategory && (
                <button
                  type="button"
                  onClick={applyAiSuggestion}
                  className="shrink-0 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-2.5 py-1 text-[11px] font-bold text-white transition-colors"
                >
                  Apply AI Tag
                </button>
              )}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachSpeedTest}
                  onChange={(e) => setAttachSpeedTest(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Attach Speed Test Diagnostic Snapshot</span>
              </label>
              {activeTestToAttach && (
                <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                  Telemetry Linked
                </span>
              )}
            </div>

            {attachSpeedTest && activeTestToAttach ? (
              <div className="rounded-lg bg-white p-3 border border-slate-200 text-xs flex items-center justify-between shadow-sm">
                <div>
                  <span className="text-slate-500">Download: </span>
                  <span className="font-mono font-bold text-slate-900">{activeTestToAttach.downloadSpeed} Mbps</span>
                  <span className="mx-2 text-slate-300">&bull;</span>
                  <span className="text-slate-500">Ping: </span>
                  <span className="font-mono font-bold text-slate-900">{activeTestToAttach.ping} ms</span>
                  <span className="mx-2 text-slate-300">&bull;</span>
                  <span className="text-slate-500">Loss: </span>
                  <span className="font-mono font-bold text-slate-900">{activeTestToAttach.packetLoss}%</span>
                </div>
                <div className="font-mono text-xs font-bold text-indigo-600">
                  Health: {activeTestToAttach.healthScore}/100
                </div>
              </div>
            ) : attachSpeedTest ? (
              <p className="text-[11px] text-amber-700">
                No recent speed test found for this location. You can run a test or submit directly.
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-500 transition-all"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Submit Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};