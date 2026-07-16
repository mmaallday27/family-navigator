// The privacy explanation — honest, pilot-grade, in plain language. This page
// is deliberately static (no family state, no auth) so it can be shown to
// anyone, including people who haven't signed in yet.

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { Card, PageHeader } from '../components/ui'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="section-title text-lg font-semibold">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}

export default function Privacy() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-7 px-4 py-8 sm:px-6 lg:px-0 lg:py-0">
      <PageHeader
        eyebrow="Privacy"
        title="How we handle your family’s information"
        subtitle="You’re trusting us with records about your child. That deserves a straight answer, not a wall of legal language. This is what we actually do."
        icon={<Lock className="h-6 w-6" />}
      />

      <Card className="border border-amber-100 bg-amber-50/60">
        <p className="text-sm leading-relaxed text-ink-soft">
          <span className="font-semibold text-ink">Family Navigator is a pilot product.</span> It
          is not a HIPAA-covered service, not a medical device, and not a substitute for
          professional advice. We have not sought legal compliance certifications yet — we’re
          telling you exactly what we do instead.
        </p>
      </Card>

      <Card className="space-y-7">
        <Section title="What we collect">
          <p>
            Only what your family gives us: the profile you fill in (your child’s first name,
            birth month and year, diagnosis, your name), the location you choose to share, the
            goals and progress you track, the documents you upload, and your conversations with
            the navigator. We don’t buy data about you, pull records from other systems, or track
            you around the web.
          </p>
        </Section>

        <Section title="Where it lives">
          <p>
            On our server, in our own database, alongside the files you upload. The database is
            backed up so a hardware failure can’t erase your record. Passwords are stored only as
            secure hashes — we can’t read them — and your session is carried by a protected
            cookie, not anything stored in the page.
          </p>
        </Section>

        <Section title="Who can see it">
          <p>
            You. Your record is tied to your account, and there are no sharing features yet — no
            other family, school, or agency can see it. A small number of our staff can access
            the systems it lives on, only for keeping the service running, never for browsing
            records.
          </p>
        </Section>

        <Section title="AI processing">
          <p>
            When you ask the navigator a question or have a document analyzed, we send the
            relevant parts of your record — profile, progress, document names and summaries, and
            the question — to our AI provider, Anthropic, to generate the answer. This happens
            through our server; the AI key and your data never appear in your browser. Our AI
            provider does not train its models on this data. When the AI is off, a built-in
            guidance engine answers and nothing leaves our server.
          </p>
        </Section>

        <Section title="No advertising. No selling. Ever.">
          <p>
            We do not sell, rent, or trade your family’s data, and we never will. There are no ads
            in the product and no advertising trackers behind it. We don’t use your data to train
            AI models.
          </p>
        </Section>

        <Section title="Your child’s information">
          <p>
            The account holder is the parent or guardian; the record is about your child, but it
            belongs to you. We are honest about a pilot limitation: we don’t yet verify anyone’s
            identity beyond their email address. Use a password you don’t use anywhere else, and
            keep it to yourself.
          </p>
        </Section>

        <Section title="How long we keep it">
          <p>
            Until you delete it. Your record stays as long as your account exists. When you delete
            a document, or your whole account, it’s gone from the live system immediately;
            encrypted backup snapshots age out within about two weeks.
          </p>
        </Section>

        <Section title="Your rights, built in">
          <p>
            You can export your entire record and every file at any time, with one click. You can
            delete individual documents, start your record over, or delete your account entirely —
            no phone call, no waiting period, no one trying to talk you out of it. These aren’t
            policies; they’re buttons. You’ll find them all in the{' '}
            <Link to="/trust" className="font-semibold text-teal-600 hover:underline">
              Trust &amp; Data page
            </Link>
            .
          </p>
        </Section>

        <Section title="Questions">
          <p>
            Ask us anything about how your data is handled — the address is in your pilot
            invitation, and a person will answer. If we ever change what’s on this page, we’ll
            tell you plainly, before the change takes effect.
          </p>
        </Section>
      </Card>

      <p className="text-xs text-ink-faint">
        Last updated July 2026 · See also the{' '}
        <Link to="/terms" className="font-medium text-teal-600 hover:underline">
          terms of the pilot
        </Link>
        .
      </p>
    </div>
  )
}
