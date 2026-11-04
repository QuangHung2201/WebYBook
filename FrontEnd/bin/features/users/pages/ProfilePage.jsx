import Loading from '@/components/common/Loading/Loading';
import ErrorState from '@/components/common/ErrorState/ErrorState';
import { USER_ROLE_LABELS } from '@/data/constants/userRoles';
import { formatDate } from '@/shared/utils/formatDate';
import { useProfile } from '../hooks/useProfile';
import ProfileForm from '../components/ProfileForm';
import ChangePasswordForm from '../components/ChangePasswordForm';
import './ProfilePage.css';

export default function ProfilePage() {
  const { profile, loading, saving, error, saveProfile, changePassword, refresh } = useProfile();

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>Tài khoản của tôi</h1>
          <p>Quản lý thông tin cá nhân và bảo mật tài khoản.</p>
        </div>
      </div>

      {loading ? (
        <Loading label="Đang tải thông tin tài khoản..." />
      ) : error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : (
        <div className="profile-layout">
          <aside className="profile-card">
            <div className="profile-card__avatar">
              {(profile?.fullName || 'U').charAt(0).toUpperCase()}
            </div>
            <h3>{profile?.fullName}</h3>
            <span className="badge badge--primary">{USER_ROLE_LABELS[profile?.role] || profile?.role}</span>
            <dl className="profile-card__meta">
              <div>
                <dt>Tên đăng nhập</dt>
                <dd>{profile?.username}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{profile?.email}</dd>
              </div>
              <div>
                <dt>Tham gia</dt>
                <dd>{formatDate(profile?.createdAt)}</dd>
              </div>
            </dl>
          </aside>

          <div className="profile-forms">
            <ProfileForm profile={profile} saving={saving} onSubmit={saveProfile} />
            <ChangePasswordForm saving={saving} onSubmit={changePassword} />
          </div>
        </div>
      )}
    </div>
  );
}
