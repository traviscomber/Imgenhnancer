"use client"

import Link from "next/link"
import { ArrowRight, RotateCw, Trash2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClarityLogo } from "@/components/clarity-logo"
import { useState } from "react"

// Mock job history - replace with real database queries
const mockJobs = [
  {
    id: "job-001",
    filename: "portrait_2026.jpg",
    preset: "Face Detail",
    mode: "x3 Restore",
    credits: 8,
    date: "July 19, 2026",
    time: "2:34 PM",
    status: "completed",
    downloadUrl: "#",
  },
  {
    id: "job-002",
    filename: "family_photo.png",
    preset: "Old Photo Restore",
    mode: "x4 Pro Restore",
    credits: 10,
    date: "July 18, 2026",
    time: "11:12 AM",
    status: "completed",
    downloadUrl: "#",
  },
  {
    id: "job-003",
    filename: "cultural_artifact.jpg",
    preset: "Cultural Detail",
    mode: "x3 Restore",
    credits: 8,
    date: "July 17, 2026",
    time: "5:48 PM",
    status: "completed",
    downloadUrl: "#",
  },
  {
    id: "job-004",
    filename: "product_shot.jpg",
    preset: "Clean Enhance",
    mode: "x2 Enhance",
    credits: 6,
    date: "July 16, 2026",
    time: "3:21 PM",
    status: "completed",
    downloadUrl: "#",
  },
]

export default function HistoryPage() {
  const [selectedJobs, setSelectedJobs] = useState<string[]>([])

  return (
    <main className="min-h-screen bg-black text-[#efe8dc]">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 lg:px-16">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="text-[#f1e5d3] hover:text-[#d7a957] transition">
            <ClarityLogo />
          </Link>
          <Button
            asChild
            variant="outline"
            className="border-[#6f5d49] bg-transparent text-[#efe8dc] hover:bg-[#221913]"
          >
            <Link href="/enhance">New enhancement</Link>
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-16">
        {/* Page Title */}
        <div className="mb-12 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-light text-[#f1e5d3] md:text-5xl">Enhancement History</h1>
            <p className="mt-3 text-sm text-[#d4c7b6]">
              View your past enhancements. Files expire 24-48 hours after processing.
            </p>
          </div>
          <Button
            variant="outline"
            className="border-[#6f5d49] bg-transparent text-[#efe8dc] hover:bg-[#221913]"
          >
            Clear history
          </Button>
        </div>

        {/* Filter/Sort Bar */}
        <div className="mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by filename..."
            className="rounded-lg border border-white/8 bg-black/40 px-4 py-2 text-sm text-[#f1e5d3] placeholder-[#6f5d49] focus:border-[#c9953d] focus:outline-none"
          />
          <select className="rounded-lg border border-white/8 bg-black/40 px-4 py-2 text-sm text-[#f1e5d3] focus:border-[#c9953d] focus:outline-none">
            <option>All presets</option>
            <option>Clean Enhance</option>
            <option>Old Photo Restore</option>
            <option>Face Detail</option>
            <option>Cultural Detail</option>
          </select>
        </div>

        {/* Jobs Table */}
        <div className="rounded-2xl border border-white/8 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/8 bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-4 text-left w-8">
                    <input
                      type="checkbox"
                      checked={selectedJobs.length === mockJobs.length}
                      onChange={(e) =>
                        setSelectedJobs(e.target.checked ? mockJobs.map((j) => j.id) : [])
                      }
                      className="rounded border-white/8"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                    Filename
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                    Preset
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                    Mode
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                    Credits
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs uppercase tracking-[0.12em] text-[#8f8678]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockJobs.map((job) => (
                  <tr key={job.id} className="border-t border-white/8 hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={(e) =>
                          setSelectedJobs(
                            e.target.checked
                              ? [...selectedJobs, job.id]
                              : selectedJobs.filter((id) => id !== job.id)
                          )
                        }
                        className="rounded border-white/8"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm text-[#f1e5d3]">{job.filename}</td>
                    <td className="px-6 py-4 text-sm text-[#d4c7b6]">{job.preset}</td>
                    <td className="px-6 py-4 text-sm text-[#d4c7b6]">{job.mode}</td>
                    <td className="px-6 py-4 text-sm text-[#f2d18a]">{job.credits}</td>
                    <td className="px-6 py-4 text-sm text-[#d4c7b6]">
                      {job.date} at {job.time}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          title="Download"
                          className="text-[#c9953d] hover:text-[#d7a957] transition"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        <button
                          title="Reprocess"
                          className="text-[#c9953d] hover:text-[#d7a957] transition"
                        >
                          <RotateCw className="h-4 w-4" />
                        </button>
                        <button
                          title="Delete"
                          className="text-[#8f8678] hover:text-red-500 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 rounded-2xl border border-white/8 bg-white/[0.03] p-6">
          <p className="text-sm leading-7 text-[#d4c7b6]">
            <span className="font-semibold text-[#f1e5d3]">Note:</span> Enhanced files are available for download for 24-48
            hours after processing. Job metadata (filename, preset, mode, date, credits) is stored permanently for your
            reference.
          </p>
        </div>
      </div>
    </main>
  )
}
