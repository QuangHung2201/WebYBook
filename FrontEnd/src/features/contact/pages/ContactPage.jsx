import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { appConfig } from '@/infrastructure/config/appConfig';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { formatDateTime } from '@/shared/utils/formatDate';
import { useContact } from '../hooks/useContact';
import ContactForm from '../components/ContactForm';
import './ContactPage.css';

const INFO = [
  { icon: Phone, label: 'Hotline', value: appConfig.support.hotline, href: `tel:${appConfig.support.hotline.replace(/\s/g, '')}` },
  { icon: Mail, label: 'Email', value: appConfig.support.email, href: `mailto:${appConfig.support.email}` },
  { icon: MapPin, label: 'Địa chỉ', value: appConfig.support.address },
  { icon: Clock, label: 'Giờ làm việc', value: appConfig.support.workingHours },
];

export default function ContactPage() {
  const { user } = useAuth();
  const { submitting, sendContact, contacts, loadingContacts, contactsError, reloadContacts } = useContact();

  return (
    <div className="page container">
      <div className="page-head">
        <div>
          <h1>Liên hệ &amp; hỗ trợ</h1>
          <p>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.</p>
        </div>
      </div>

      <div className="contact-layout">
        <div className="contact-info">
          {INFO.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="contact-info__card">
                <span className="contact-info__icon">
                  <Icon size={20} />
                </span>
                <div>
                  <span className="contact-info__label">{item.label}</span>
                  {item.href ? (
                    <a href={item.href}>{item.value}</a>
                  ) : (
                    <strong>{item.value}</strong>
                  )}
                </div>
              </div>
            );
          })}

          <div className="contact-info__note">
            <strong>Bạn cần hỗ trợ nhanh?</strong>
            <p className="muted">
              Gọi hotline {appConfig.support.hotline} hoặc gửi email tới {appConfig.support.email}.
              Đội ngũ WebYBook phản hồi trong vòng 24 giờ làm việc.
            </p>
          </div>
        </div>

        <ContactForm submitting={submitting} onSubmit={sendContact} user={user} />
      </div>

      {user ? (
        <section className="contact-history panel">
          <h2 className="panel-title">Yêu cầu hỗ trợ của bạn</h2>
          {loadingContacts ? <p className="muted">Đang tải lịch sử liên hệ...</p> : null}
          {contactsError ? (
            <div role="alert" className="contact-history__error">
              <p>{contactsError}</p>
              <button type="button" className="link" onClick={reloadContacts}>Thử lại</button>
            </div>
          ) : null}
          {!loadingContacts && !contactsError && contacts.length === 0 ? (
            <p className="muted">Bạn chưa gửi yêu cầu hỗ trợ nào.</p>
          ) : null}
          {!contactsError ? contacts.map((contact) => (
            <article className="contact-history__item" key={contact.id}>
              <div className="contact-history__head">
                <strong>#{contact.id} · {contact.subject}</strong>
                <span>{({ pending: 'Chờ xử lý', processing: 'Đang xử lý', responded: 'Đã phản hồi', completed: 'Đã hoàn thành' }[String(contact.status || '').toLowerCase()] || contact.status || 'Chờ xử lý')}</span>
              </div>
              <p>{contact.message}</p>
              <small className="muted">Gửi lúc {formatDateTime(contact.createdAt)}</small>
            </article>
          )) : null}
        </section>
      ) : null}
    </div>
  );
}
