import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { appConfig } from '@/infrastructure/config/appConfig';
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
  const { submitting, sendContact } = useContact();

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

        <ContactForm submitting={submitting} onSubmit={sendContact} />
      </div>
    </div>
  );
}
