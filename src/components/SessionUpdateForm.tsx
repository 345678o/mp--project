'use client';

import React, { useState, useEffect } from 'react';
import { Session } from '../data/session.model';
import { getCurrentMentor } from '../data/auth';

interface Mentor {
  username: string;
  email: string;
}

interface SessionUpdateFormProps {
  session: Session;
  onUpdate: (updatedSession: Partial<Session>) => Promise<void>;
}

export const SessionUpdateForm: React.FC<SessionUpdateFormProps> = ({ session, onUpdate }) => {
  const [attendanceFile, setAttendanceFile] = useState<File | null>(null);
  const [selectedSubMentor, setSelectedSubMentor] = useState<string>(session.subMentor || '');
  const [substituteMentor, setSubstituteMentor] = useState<string>('');
  const [sessionProgress, setSessionProgress] = useState<string>(session.sessionProgress || '');
  const [availableMentors, setAvailableMentors] = useState<string[]>([]);
  const [subMentors, setSubMentors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const currentMentor = getCurrentMentor();

  useEffect(() => {
    const fetchMentors = async () => {
      try {
        // Fetch sub-mentors
        const subMentorsRes = await fetch('/api/mentors/sub-mentors');
        if (subMentorsRes.ok) {
          const subs: Mentor[] = await subMentorsRes.json();
          setSubMentors(subs.map(s => s.username));
        }

        // Fetch available substitutes
        const params = new URLSearchParams({
          date: session.date.toString(),
          timeSlot: session.timeSlot,
          slot: session.slot,
          currentMentor: currentMentor || ''
        });

        const availableRes = await fetch(`/api/mentors/available-substitutes?${params}`);
        if (availableRes.ok) {
          const mentors: Mentor[] = await availableRes.json();
          setAvailableMentors(mentors.map(m => m.username));
        }
      } catch (error) {
        console.error('Error fetching mentors:', error);
      }
    };

    fetchMentors();
  }, [session.date, session.timeSlot, session.slot, currentMentor]);

  const handleAttendanceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttendanceFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let attendanceUrl = session.attendanceImage;

      if (attendanceFile) {
        // Upload attendance image and get URL
        const formData = new FormData();
        formData.append('file', attendanceFile);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (uploadRes.ok) {
          const { url } = await uploadRes.json();
          attendanceUrl = url;
        }
      }

      // Determine if this mentor is mentor1 or mentor2
      const isMentor1 = session.studentMentor1 === currentMentor;
      const isMentor2 = session.studentMentor2 === currentMentor;

      // Prepare update data
      const updateData: Partial<Session> = {
        lastUpdated: new Date(),
        attendanceImage: attendanceUrl,
        subMentor: selectedSubMentor || undefined,
        sessionProgress: sessionProgress || undefined
      };

      // Handle substitution
      if (substituteMentor) {
        if (isMentor1) {
          updateData.substitutedMentor1 = {
            originalMentor: currentMentor!,
            substituteMentor: substituteMentor,
          };
        } else if (isMentor2) {
          updateData.substitutedMentor2 = {
            originalMentor: currentMentor!,
            substituteMentor: substituteMentor,
          };
        }
      }

      // Mark session as completed if either mentor has submitted their part
      if (sessionProgress && attendanceUrl) {
        updateData.status = 'completed';
        updateData.completedAt = new Date();
      }

      await onUpdate(updateData);
    } catch (error) {
      console.error('Error updating session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isCurrentMentorSubstituted = 
    (session.substitutedMentor1?.originalMentor === currentMentor) ||
    (session.substitutedMentor2?.originalMentor === currentMentor);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block mb-2">Session Progress</label>
        <textarea
          value={sessionProgress}
          onChange={(e) => setSessionProgress(e.target.value)}
          className="w-full p-2 border rounded min-h-[100px]"
          placeholder="Enter session progress details..."
          required
        />
      </div>

      <div>
        <label className="block mb-2">Attendance Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleAttendanceUpload}
          className="w-full p-2 border rounded"
          required={!session.attendanceImage}
        />
        {session.attendanceImage && (
          <img 
            src={session.attendanceImage} 
            alt="Current attendance" 
            className="mt-2 max-w-xs"
          />
        )}
      </div>

      <div>
        <label className="block mb-2">Sub-Mentor</label>
        <select
          value={selectedSubMentor}
          onChange={(e) => setSelectedSubMentor(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Select Sub-Mentor</option>
          {subMentors.map(mentor => (
            <option key={mentor} value={mentor}>{mentor}</option>
          ))}
        </select>
      </div>

      {!isCurrentMentorSubstituted && (
        <div>
          <label className="block mb-2">Substitute Mentor (Optional)</label>
          <select
            value={substituteMentor}
            onChange={(e) => setSubstituteMentor(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select Substitute</option>
            {availableMentors.map(mentor => (
              <option key={mentor} value={mentor}>{mentor}</option>
            ))}
          </select>
          {availableMentors.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              No mentors available for substitution in this time slot
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !sessionProgress}
        className={`w-full p-2 text-white rounded ${
          isLoading || !sessionProgress ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isLoading ? 'Updating...' : 'Complete Session'}
      </button>
    </form>
  );
}; 