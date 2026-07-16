// Plain-language terms for the pilot — the boundaries of what this product is
// and isn't, written for a stressed parent, not a courtroom. Static on purpose
// (no family state, no auth) so it can be shown before sign-in.

import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ScrollText } from 'lucide-react'
import { Card, PageHeader } from '../components/ui'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="section-title text-lg font-semibold">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-ink-soft">{children}</div>
    </section>
  )
}

export default function Terms() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-7 px-4 py-8 sm:px-6 lg:px-0 lg:py-0">
      <PageHeader
        eyebrow="Terms of the pilot"
        title="What we are, what we aren’t, and what we ask of you"
        subtitle="The whole agreement, in plain words. If anything here surprises you, tell us — that means we wrote it badly."
        icon={<ScrollText className="h-6 w-6" />}
      />

      <Card className="space-y-7">
        <Section title="What Family Navigator is">
          <p>
            A navigation and organization tool for your family’s journey: it holds your record,
            keeps track of what’s coming, helps you understand documents, and helps you arrive at
            meetings prepared. It’s a pilot — we’re building it with early families like yours.
          </p>
        </Section>

        <Section title="What it is not">
          <p>
            It is not medical, legal, financial, or educational advice, and it is not an emergency
            service. Nothing here diagnoses, treats, or decides. For decisions about your child’s
            health, rights, money, or schooling, work with a qualified professional — the product
            exists to make those conversations easier, never to replace them. If someone is in
            immediate danger, call your local emergency number, not this app.
          </p>
        </Section>

        <Section title="Guidance can be wrong">
          <p>
            We work hard to keep guidance accurate, but it can contain errors, and rules vary by
            state and change over time. Always verify dates, deadlines, and eligibility against
            your official letters and the agency itself. Every answer in the product is labeled
            with where it came from, so you can tell facts from suggestions.
          </p>
        </Section>

        <Section title="Your content is yours">
          <p>
            Everything you put in — the profile, documents, goals, conversations — belongs to your
            family, not to us. You can export all of it at any time and take it anywhere,
            including to another service. We will never hold your record hostage.
          </p>
        </Section>

        <Section title="What we ask of you">
          <p>
            Use the product for your own family, keep your password private, and only upload
            documents you have the right to hold. Don’t try to break into other accounts, disrupt
            the service, or use it to harm anyone. That’s the whole list.
          </p>
        </Section>

        <Section title="If the pilot ends">
          <p>
            We may need to change or end the pilot. If that happens, we’ll give you notice ahead
            of time, remind you to export your record, and give you a real window to do it — you
            will not lose your data without warning.
          </p>
        </Section>

        <Section title="Changes to these terms">
          <p>
            If we change these terms, we’ll announce it inside the product before the change takes
            effect and say what changed in plain language — no silent updates.
          </p>
        </Section>
      </Card>

      <p className="text-xs text-ink-faint">
        Last updated July 2026 · See also{' '}
        <Link to="/privacy" className="font-medium text-teal-600 hover:underline">
          how we handle your information
        </Link>{' '}
        and{' '}
        <Link to="/trust" className="font-medium text-teal-600 hover:underline">
          your data, in plain words
        </Link>
        .
      </p>
    </div>
  )
}
