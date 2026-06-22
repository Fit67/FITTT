import { redirect } from 'next/navigation'

/**
 * /admin root page — redirects to the dashboard.
 * This ensures visiting /admin directly always lands on /admin/dashboard.
 */
export default function AdminPage() {
  redirect('/admin/dashboard')
}
