import React from 'react';
import { useForm, ValidationError } from '@formspree/react';

/** The Formspree form the classic contact form also posts to. */
const FORMSPREE_ID = 'mdkjokdw';

type Field = 'date' | 'name' | 'email' | 'phone' | 'message';
type Values = Readonly<Record<Field, string>>;

const EMPTY: Values = { date: '', name: '', email: '', phone: '', message: '' };

const inputClass =
  'mt-2 block w-full border-0 border-b border-brand-charcoal/30 bg-transparent px-0 py-2 text-lg placeholder:text-brand-charcoal/40 focus:border-brand-gold focus:outline-none focus:ring-0';
const labelClass =
  'block text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand-charcoal/70';

interface InputProps {
  field: Field;
  label: string;
  values: Values;
  onChange: (field: Field, value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}

const Input: React.FC<InputProps> = ({
  field,
  label,
  values,
  onChange,
  type = 'text',
  ...rest
}) => (
  <div>
    <label htmlFor={`xp-${field}`} className={labelClass}>
      {label}
    </label>
    <input
      id={`xp-${field}`}
      name={field}
      type={type}
      value={values[field]}
      onChange={(event) => onChange(field, event.target.value)}
      className={inputClass}
      {...rest}
    />
  </div>
);

const buttonClass =
  'rounded-full bg-brand-gold px-8 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#2a2522] transition-colors hover:bg-brand-charcoal hover:text-white disabled:opacity-60';

interface StepProps {
  values: Values;
  onChange: (field: Field, value: string) => void;
}

const FirstStep = React.forwardRef<
  HTMLFieldSetElement,
  StepProps & {
    hidden: boolean;
    errors: React.ComponentProps<typeof ValidationError>['errors'];
  }
>(({ values, onChange, hidden, errors }, ref) => (
  <fieldset ref={ref} hidden={hidden} className="mt-6 space-y-7">
    <legend className="sr-only">Your date and how to reach you</legend>
    <Input
      field="date"
      label="Your date, or a range"
      placeholder="June 2027, or a few Saturdays"
      values={values}
      onChange={onChange}
    />
    <Input
      field="name"
      label="Your name"
      autoComplete="name"
      required
      values={values}
      onChange={onChange}
    />
    <Input
      field="email"
      label="Email"
      type="email"
      autoComplete="email"
      required
      values={values}
      onChange={onChange}
    />
    <ValidationError
      prefix="Email"
      field="email"
      errors={errors}
      className="text-sm text-red-700"
    />
  </fieldset>
));
FirstStep.displayName = 'FirstStep';

const SecondStep: React.FC<StepProps> = ({ values, onChange }) => (
  <fieldset className="mt-6 space-y-7">
    <legend className="sr-only">More details, if you like</legend>
    <Input
      field="phone"
      label="Phone"
      type="tel"
      autoComplete="tel"
      values={values}
      onChange={onChange}
    />
    <div>
      <label htmlFor="xp-message" className={labelClass}>
        Anything we should know?
      </label>
      <textarea
        id="xp-message"
        name="message"
        rows={3}
        value={values.message}
        onChange={(event) => onChange('message', event.target.value)}
        placeholder="Guest count, ceremony ideas, questions"
        className={inputClass}
      />
    </div>
  </fieldset>
);

interface ActionsProps {
  step: 1 | 2;
  submitting: boolean;
  onBack: () => void;
}

const Actions: React.FC<ActionsProps> = ({ step, submitting, onBack }) => (
  <div className="mt-9 flex flex-wrap items-center gap-4">
    {step === 2 && (
      <button
        type="button"
        onClick={onBack}
        className="text-xs font-semibold uppercase tracking-[0.2em] opacity-70 hover:opacity-100"
      >
        Back
      </button>
    )}
    <button type="submit" disabled={submitting} className={buttonClass}>
      {step === 1 ? 'Continue' : 'Send inquiry'}
    </button>
    {step === 2 && (
      <p className="text-sm opacity-70">Both fields are optional.</p>
    )}
  </div>
);

const Thanks: React.FC = () => (
  <div role="status" className="py-10 text-center">
    <p className="font-serif text-4xl">Thank you.</p>
    <p className="mt-3 opacity-80">
      Your inquiry is on its way. We&apos;ll be in touch about your date soon.
    </p>
  </div>
);

/**
 * A two-step inquiry: the date, a name and an email first, then optional
 * details. It posts the same fields to the same Formspree form as the
 * classic contact form, so both reach the owner the same way. The first
 * step stays in the form while hidden, so one send carries every field.
 */
const InquiryForm: React.FC = () => {
  const [state, handleSubmit] = useForm(FORMSPREE_ID);
  const [step, setStep] = React.useState<1 | 2>(1);
  const [values, setValues] = React.useState<Values>(EMPTY);
  const firstStep = React.useRef<HTMLFieldSetElement>(null);
  const change = (field: Field, value: string) =>
    setValues((previous) => ({ ...previous, [field]: value }));

  if (state.succeeded) return <Thanks />;

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    if (step === 2) return handleSubmit(event);
    // On the first step, Enter or Continue checks the fields and moves on.
    event.preventDefault();
    const invalid =
      firstStep.current?.querySelector<HTMLInputElement>('input:invalid');
    if (invalid) {
      invalid.reportValidity();
      return;
    }
    setStep(2);
  };

  return (
    <form aria-label="Inquiry" onSubmit={submit}>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-brand-gold">
        Step {step} of 2
      </p>
      <FirstStep
        ref={firstStep}
        hidden={step !== 1}
        errors={state.errors}
        values={values}
        onChange={change}
      />
      {step === 2 && <SecondStep values={values} onChange={change} />}
      {state.errors && (
        <p role="alert" className="mt-6 text-sm text-red-700">
          That didn&apos;t send. Please check your email address and try again.
        </p>
      )}
      <Actions
        step={step}
        submitting={state.submitting}
        onBack={() => setStep(1)}
      />
    </form>
  );
};

export default InquiryForm;
