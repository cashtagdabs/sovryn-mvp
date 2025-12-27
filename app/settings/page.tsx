import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>
        
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-purple-500/20 p-8">
          <div className="space-y-8">
            {/* Account Settings */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Account</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Email</span>
                  <span className="text-white">Manage in Clerk</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Password</span>
                  <span className="text-white">Manage in Clerk</span>
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Preferences</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Theme</span>
                  <select className="bg-slate-600 text-white px-3 py-2 rounded">
                    <option>Auto</option>
                    <option>Light</option>
                    <option>Dark</option>
                  </select>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Notifications</span>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>
              </div>
            </section>

            {/* Privacy & Security */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Privacy & Security</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Data Privacy</span>
                  <span className="text-purple-400">GDPR Compliant</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-slate-700/30 rounded-lg">
                  <span className="text-gray-300">Two-Factor Authentication</span>
                  <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition">
                    Enable
                  </button>
                </div>
              </div>
            </section>

            {/* Danger Zone */}
            <section>
              <h2 className="text-2xl font-semibold text-red-400 mb-4">Danger Zone</h2>
              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition font-semibold">
                  Delete Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
