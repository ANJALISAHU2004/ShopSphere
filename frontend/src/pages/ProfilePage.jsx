import { useState } from 'react';
import ChangePasswordForm from '../components/profile/ChangePasswordForm.jsx';
import ProfileAddresses from '../components/profile/ProfileAddresses.jsx';
import ProfileDetailsForm from '../components/profile/ProfileDetailsForm.jsx';
import ProfileReviews from '../components/profile/ProfileReviews.jsx';
import { Alert, ErrorState, Skeleton } from '../components/ui/index.js';
import { useChangePassword } from '../hooks/useChangePassword.js';
import { useProfile, useUpdateProfile } from '../hooks/useProfile.js';

const PROFILE_TABS = [
  { id: 'details', label: 'Details' },
  { id: 'addresses', label: 'Addresses' },
  { id: 'security', label: 'Security' },
  { id: 'reviews', label: 'My reviews' },
];

/** Renders account details, saved addresses, password security, and reviews. */
export default function ProfilePage() {
  const profileQuery = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const [activeTab, setActiveTab] = useState('details');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  async function savePassword(passwords) {
    setPasswordSuccess('');
    await changePasswordMutation.mutateAsync(passwords);
    setPasswordSuccess('Your password has been changed.');
  }

  function handleTabKeyDown(event) {
    const activeIndex = PROFILE_TABS.findIndex((tab) => tab.id === activeTab);
    let nextIndex = activeIndex;
    if (event.key === 'ArrowRight') {
      nextIndex = (activeIndex + 1) % PROFILE_TABS.length;
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (activeIndex - 1 + PROFILE_TABS.length) % PROFILE_TABS.length;
    } else if (event.key === 'Home') {
      nextIndex = 0;
    } else if (event.key === 'End') {
      nextIndex = PROFILE_TABS.length - 1;
    } else {
      return;
    }
    event.preventDefault();
    const nextTab = PROFILE_TABS[nextIndex];
    setActiveTab(nextTab.id);
    document.getElementById(`profile-tab-${nextTab.id}`)?.focus();
  }

  if (profileQuery.isPending) {
    return (
      <section className="profile-page" aria-labelledby="profile-heading">
        <Skeleton className="profile-page__skeleton" label="Loading profile" />
        <Skeleton className="profile-page__skeleton" />
      </section>
    );
  }

  if (profileQuery.isError) {
    return (
      <ErrorState
        message={profileQuery.error.message}
        onRetry={() => profileQuery.refetch()}
      />
    );
  }

  const profile = profileQuery.data;

  return (
    <section className="profile-page" aria-labelledby="profile-heading">
      <header className="profile-page__header">
        <div>
          <p className="profile-page__eyebrow">Account</p>
          <h1 id="profile-heading">Your profile</h1>
        </div>
        <p>Manage your details, delivery addresses, and reviews.</p>
      </header>

      <div
        className="profile-tabs"
        role="tablist"
        aria-label="Profile sections"
      >
        {PROFILE_TABS.map((tab) => (
          <button
            aria-controls="profile-panel"
            aria-selected={activeTab === tab.id}
            className="profile-tabs__tab"
            id={`profile-tab-${tab.id}`}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={handleTabKeyDown}
            role="tab"
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        aria-labelledby={`profile-tab-${activeTab}`}
        className="profile-panel"
        id="profile-panel"
        role="tabpanel"
        tabIndex={0}
      >
        {activeTab === 'details' && (
          <section aria-labelledby="profile-details-heading">
            <h2 id="profile-details-heading">Personal details</h2>
            <ProfileDetailsForm
              key={profile.id}
              profile={profile}
              onSave={(values) => updateProfileMutation.mutateAsync(values)}
            />
          </section>
        )}
        {activeTab === 'addresses' && <ProfileAddresses />}
        {activeTab === 'security' && (
          <section aria-labelledby="profile-security-heading">
            <h2 id="profile-security-heading">Change password</h2>
            {passwordSuccess && (
              <Alert variant="success">{passwordSuccess}</Alert>
            )}
            <ChangePasswordForm onSave={savePassword} />
          </section>
        )}
        {activeTab === 'reviews' && (
          <section aria-labelledby="profile-reviews-heading">
            <h2 id="profile-reviews-heading">My reviews</h2>
            <ProfileReviews />
          </section>
        )}
      </div>
    </section>
  );
}
