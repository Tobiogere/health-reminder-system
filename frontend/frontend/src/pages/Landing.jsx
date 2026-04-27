import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const roles = [
    {
      icon: '🧑‍⚕️',
      title: 'Patient',
      color: '#0d6efd',
      bg: '#e8f0fe',
      description: 'View your medication schedule, mark doses as taken, track your prescription history and request renewals — all in one place.',
      features: ['Daily medication reminders', 'Mark doses as taken', 'Prescription history', 'Renewal requests'],
    },
    {
      icon: '👨‍⚕️',
      title: 'Doctor',
      color: '#198754',
      bg: '#e8f5ee',
      description: 'Search for patients, write digital prescriptions and send them directly to the pharmacy — no paperwork needed.',
      features: ['Search patients by ID', 'Write digital prescriptions', 'Track prescription status', 'Monitor missed doses'],
    },
    {
      icon: '💊',
      title: 'Pharmacist',
      color: '#6f42c1',
      bg: '#f0ebff',
      description: 'Receive prescriptions from doctors, add dosage details, generate medication schedules and handle patient renewal requests.',
      features: ['Prescription queue', 'Add dosage & frequency', 'Generate schedules', 'Handle renewals'],
    },
  ];

  const steps = [
    { number: '01', icon: '🏥', title: 'Patient Visits', description: 'Patient visits the health centre and provides their ID. The doctor searches for them in the system.' },
    { number: '02', icon: '📋', title: 'Doctor Prescribes', description: 'Doctor enters the diagnosis and selects prescribed drugs. The prescription is sent digitally to the pharmacy.' },
    { number: '03', icon: '💊', title: 'Pharmacist Processes', description: 'Pharmacist adds dosage, frequency, duration and specific reminder times. The medication schedule is generated.' },
    { number: '04', icon: '🔔', title: 'Patient Gets Reminders', description: 'Patient receives in-app reminders at each scheduled time and marks each dose as taken.' },
  ];

  const testimonials = [
    { name: 'Chukwuemeka O.', role: 'Student Patient', avatar: 'C', color: '#0d6efd', text: 'I used to forget my medications all the time. Now I get reminded exactly when to take each one. My recovery has been so much faster.' },
    { name: 'Dr. Adebayo', role: 'Medical Doctor', avatar: 'A', color: '#198754', text: 'Writing prescriptions digitally and knowing the pharmacist receives them instantly has completely changed how I work. No more paper trails.' },
    { name: 'Pharm. Salako', role: 'Pharmacist', avatar: 'S', color: '#6f42c1', text: 'The queue system is incredibly organised. I can see all pending prescriptions, add dosage details and generate schedules in minutes.' },
  ];

  const RoleCard = ({ role }) => (
    <div
      style={{
        borderRadius: '14px',
        padding: '2rem',
        height: '100%',
        border: `1px solid ${role.color}22`,
        backgroundColor: role.bg,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = `0 12px 30px ${role.color}22`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          width: '52px', height: '52px',
          borderRadius: '12px',
          backgroundColor: role.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0,
        }}>
          {role.icon}
        </div>
        <h3 style={{ fontWeight: 800, fontSize: '1.2rem', color: '#1e2a38', margin: 0 }}>
          {role.title}
        </h3>
      </div>
      <p style={{ fontSize: '0.88rem', color: '#495057', lineHeight: 1.7, marginBottom: '1.2rem' }}>
        {role.description}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {role.features.map((f, fi) => (
          <div key={fi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: '#495057' }}>
            <span style={{ color: role.color, fontWeight: 700 }}>✓</span>
            {f}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#212529', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 1000,
        backgroundColor: scrolled ? '#ffffff' : 'transparent',
        borderBottom: scrolled ? '1px solid #e9ecef' : 'none',
        boxShadow: scrolled ? '0 2px 20px rgba(0,0,0,0.08)' : 'none',
        transition: 'all 0.3s ease',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🎓</span>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: scrolled ? '#1e2a38' : '#ffffff' }}>
            RUN Med Reminder
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {[
            { label: 'How it Works', id: 'how-it-works' },
            { label: 'Roles',        id: 'roles'        },
            { label: 'Testimonials', id: 'testimonials' },
          ].map(link => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.88rem', fontWeight: 500,
                color: scrolled ? '#495057' : 'rgba(255,255,255,0.85)',
                transition: 'color 0.2s',
                display: window.innerWidth < 768 ? 'none' : 'block',
              }}
            >
              {link.label}
            </button>
          ))}

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <Link to="/login" style={{
              padding: '0.4rem 1.1rem', borderRadius: '6px',
              fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
              border: scrolled ? '1px solid #0d6efd' : '1px solid rgba(255,255,255,0.6)',
              color: scrolled ? '#0d6efd' : '#ffffff',
              backgroundColor: 'transparent', transition: 'all 0.2s',
            }}>
              Login
            </Link>
            <Link to="/register" style={{
              padding: '0.4rem 1.1rem', borderRadius: '6px',
              fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none',
              backgroundColor: '#C9A84C', color: '#ffffff',
              border: '1px solid #C9A84C', transition: 'all 0.2s',
            }}>
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section id="home" style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #6B0F1A 0%, #8B1A2A 50%, #C9A84C 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '6rem 1.5rem 4rem',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-50px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '750px', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '999px', padding: '0.35rem 1rem',
            fontSize: '0.78rem', fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '1.5rem',
          }}>
            🎓 Redeemer's University Health Center
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900,
            color: '#ffffff', lineHeight: 1.15, marginBottom: '1.2rem', letterSpacing: '-0.02em',
          }}>
            Never Miss a Medication<br />
            <span style={{ color: '#F5D98B' }}>Again.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.15rem)',
            color: 'rgba(255,255,255,0.75)', lineHeight: 1.7,
            maxWidth: '580px', margin: '0 auto 2.5rem',
          }}>
            A complete digital prescription and medication reminder system for students, staff and external patients at the University Health Centre.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              backgroundColor: '#0d6efd', color: '#fff',
              padding: '0.85rem 2rem', borderRadius: '8px',
              textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
              boxShadow: '0 4px 20px rgba(13,110,253,0.4)', transition: 'all 0.2s',
            }}>
              Get Started — It's Free
            </Link>
            <Link to="/login" style={{
              backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff',
              padding: '0.85rem 2rem', borderRadius: '8px',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
              border: '1px solid rgba(255,255,255,0.25)', transition: 'all 0.2s',
            }}>
              Login to Dashboard →
            </Link>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '3rem', marginTop: '4rem', flexWrap: 'wrap' }}>
            {[
              { value: '3',    label: 'User Roles'            },
              { value: '100%', label: 'Digital Prescriptions' },
              { value: '24/7', label: 'Medication Reminders'  },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F5D98B' }}>{stat.value}</div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500, marginTop: '0.2rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '5rem 1.5rem', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              THE PROCESS
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#1e2a38', marginBottom: '0.75rem' }}>
              How It Works
            </h2>
            <p style={{ color: '#6c757d', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              From clinic visit to medication reminder in four simple steps.
            </p>
          </div>

          <div className="row g-4">
            {steps.map((step, i) => (
              <div key={i} className="col-12 col-md-6 col-lg-3">
                <div style={{
                  backgroundColor: '#ffffff', borderRadius: '12px',
                  padding: '1.75rem 1.5rem', height: '100%',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #e9ecef',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: '-10px', right: '10px',
                    fontSize: '4rem', fontWeight: 900, color: '#f0f4ff',
                    lineHeight: 1, userSelect: 'none',
                  }}>
                    {step.number}
                  </div>
                  <div style={{ fontSize: '2.2rem', marginBottom: '1rem' }}>{step.icon}</div>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.6rem', color: '#1e2a38' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#6c757d', lineHeight: 1.6, margin: 0 }}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLES ── */}
      <section id="roles" style={{ padding: '5rem 1.5rem', backgroundColor: '#ffffff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              FOR EVERYONE
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#1e2a38', marginBottom: '0.75rem' }}>
              Built for Every Role
            </h2>
            <p style={{ color: '#6c757d', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
              One system designed specifically for patients, doctors and pharmacists.
            </p>
          </div>

          {/* Row 1 — Patient + Doctor side by side */}
          <div className="row g-4 justify-content-center">
            {roles.slice(0, 2).map((role, i) => (
              <div key={i} className="col-12 col-md-6">
                <RoleCard role={role} />
              </div>
            ))}
          </div>

          {/* Row 2 — Pharmacist centered below */}
          <div className="row g-4 justify-content-center mt-2">
            <div className="col-12 col-md-6">
              <RoleCard role={roles[2]} />
            </div>
          </div>

        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: '5rem 1.5rem', backgroundColor: '#f8f9fa' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#C9A84C', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              TESTIMONIALS
            </div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#1e2a38', marginBottom: '0.75rem' }}>
              What People Are Saying
            </h2>
            <p style={{ color: '#6c757d', fontSize: '1rem', maxWidth: '450px', margin: '0 auto' }}>
              From patients to healthcare professionals — here is what the system means to them.
            </p>
          </div>

          <div className="row g-4">
            {testimonials.map((t, i) => (
              <div key={i} className="col-12 col-md-4">
                <div style={{
                  backgroundColor: '#ffffff', borderRadius: '14px',
                  padding: '1.75rem', height: '100%',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  border: '1px solid #e9ecef',
                  display: 'flex', flexDirection: 'column',
                }}>
                  <div style={{ fontSize: '2.5rem', color: '#e9ecef', fontWeight: 900, lineHeight: 1, marginBottom: '0.75rem' }}>
                    "
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#495057', lineHeight: 1.7, flex: 1, marginBottom: '1.25rem' }}>
                    {t.text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      backgroundColor: t.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0,
                    }}>
                      {t.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#1e2a38' }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6c757d' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        padding: '5rem 1.5rem',
        background: 'linear-gradient(135deg, #6B0F1A 0%, #8B1A2A 100%)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#ffffff', marginBottom: '1rem' }}>
            Ready to take control of your health?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '2rem', lineHeight: 1.7 }}>
            Join the University Health Centre digital system today. Register as a patient, doctor or pharmacist.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{
              backgroundColor: '#0d6efd', color: '#fff',
              padding: '0.85rem 2rem', borderRadius: '8px',
              textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem',
              boxShadow: '0 4px 20px rgba(13,110,253,0.4)',
            }}>
              Create Account
            </Link>
            <Link to="/login" style={{
              backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff',
              padding: '0.85rem 2rem', borderRadius: '8px',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
              border: '1px solid rgba(255,255,255,0.25)',
            }}>
              Already have an account? Login
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        backgroundColor: '#6B0F1A',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        padding: '3rem 1.5rem 2rem',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="row g-4 mb-4">

            <div className="col-12 col-md-4">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '1.3rem' }}>🏥</span>
                <span style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.95rem' }}>RUN Med Reminder</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, margin: 0 }}>
                A digital prescription and medication reminder system for the University Health Centre community.
              </p>
            </div>

            <div className="col-6 col-md-2">
              <h6 style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem', marginBottom: '1rem' }}>Quick Links</h6>
              {['Home', 'How it Works', 'Roles', 'Testimonials'].map(link => (
                <div key={link} style={{ marginBottom: '0.5rem' }}>
                  <button
                    onClick={() => scrollTo(link.toLowerCase().replace(/ /g, '-'))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', padding: 0, textAlign: 'left' }}
                  >
                    {link}
                  </button>
                </div>
              ))}
            </div>

            <div className="col-6 col-md-2">
              <h6 style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem', marginBottom: '1rem' }}>Access</h6>
              {[
                { label: 'Login',    to: '/login'    },
                { label: 'Register', to: '/register' },
              ].map(link => (
                <div key={link.label} style={{ marginBottom: '0.5rem' }}>
                  <Link to={link.to} style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>

            <div className="col-12 col-md-4">
              <h6 style={{ fontWeight: 700, color: '#ffffff', fontSize: '0.85rem', marginBottom: '1rem' }}>Contact</h6>
              {[
                { icon: '📍', text: "Redeemer's University, Ede, Osun State" },
                { icon: '📞', text: '+234 800 000 0000'                    },
                { icon: '✉️', text: 'health@run.edu.ng'             },
                { icon: '🕐', text: 'Mon – Fri: 8:00 AM – 5:00 PM'        },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '0.82rem' }}>{item.icon}</span>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              © 2026 Redeemer's University Health Centre. All rights reserved.
            </p>
            <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)', margin: 0 }}>
              Medication Reminder & Prescription Management System
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;