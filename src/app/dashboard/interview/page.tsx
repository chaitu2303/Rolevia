import { redirect } from 'next/navigation';

export default function InterviewLobbyRedirect() {
  redirect('/dashboard/interview/new');
}
