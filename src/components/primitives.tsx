import { CheckIcon, Cross2Icon, ReloadIcon } from "@radix-ui/react-icons"
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react"

import styles from "@/components/primitives.module.css"

type ActionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  readonly variant?: "primary" | "secondary" | "verified" | "danger"
  readonly loading?: boolean
}

export function ActionButton({
  variant = "primary",
  loading = false,
  disabled,
  children,
  type = "button",
  ...props
}: ActionButtonProps) {
  return (
    <button
      {...props}
      aria-busy={loading}
      className={`${styles["actionButton"]} ${styles[variant]}`}
      disabled={disabled || loading}
      type={type}
    >
      {loading ? <ReloadIcon aria-hidden="true" className={styles["spinner"]} /> : null}
      <span>{children}</span>
    </button>
  )
}

type StatusChipProps = {
  readonly tone?: "neutral" | "verified" | "warning" | "error"
  readonly children: ReactNode
}

export function StatusChip({ tone = "neutral", children }: StatusChipProps) {
  return <span className={`${styles["statusChip"]} ${styles[tone]}`}>{children}</span>
}

export type RailStep = {
  readonly label: string
  readonly detail: string
  readonly state: "pending" | "current" | "complete" | "blocked"
}

type VerificationRailProps = {
  readonly steps: readonly RailStep[]
}

export function VerificationRail({ steps }: VerificationRailProps) {
  return (
    <ol className={styles["rail"]} aria-label="참여 단계">
      {steps.map((step, index) => (
        <li className={`${styles["railStep"]} ${styles[step.state]}`} key={step.label}>
          <span className={styles["railMarker"]} aria-hidden="true">
            {step.state === "complete" ? <CheckIcon /> : index + 1}
          </span>
          <span>
            <strong>{step.label}</strong>
            <small>{step.detail}</small>
          </span>
          <span className="sr-only">{railStateLabel(step.state)}</span>
        </li>
      ))}
    </ol>
  )
}

function railStateLabel(state: RailStep["state"]): string {
  switch (state) {
    case "pending":
      return "대기"
    case "current":
      return "현재 단계"
    case "complete":
      return "완료"
    case "blocked":
      return "진행 불가"
  }
}

type QuizOptionProps = {
  readonly name: string
  readonly value: string
  readonly label: string
  readonly checked?: boolean
  readonly disabled?: boolean
  readonly result?: "correct" | "incorrect"
  readonly onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"]
}

export function QuizOption({
  name,
  value,
  label,
  checked = false,
  disabled = false,
  result,
  onChange,
}: QuizOptionProps) {
  const resultClass = result === undefined ? "" : styles[result]
  return (
    <label className={`${styles["quizOption"]} ${resultClass}`}>
      <input
        checked={checked}
        disabled={disabled}
        name={name}
        onChange={onChange}
        type="radio"
        value={value}
      />
      <span className={styles["optionMarker"]} aria-hidden="true" />
      <span className={styles["optionLabel"]}>{label}</span>
      {result === "correct" ? <CheckIcon aria-label="정답" /> : null}
      {result === "incorrect" ? <Cross2Icon aria-label="오답" /> : null}
    </label>
  )
}

type MetricTileProps = {
  readonly label: string
  readonly value: string
  readonly detail: string
  readonly tone?: "default" | "warning"
}

export function MetricTile({ label, value, detail, tone = "default" }: MetricTileProps) {
  return (
    <div className={`${styles["metricTile"]} ${styles[tone]}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  )
}

type FormFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  readonly id: string
  readonly label: string
  readonly helper: string
  readonly error?: string
}

export function FormField({ id, label, helper, error, ...inputProps }: FormFieldProps) {
  const descriptionId = `${id}-description`
  return (
    <div className={styles["formField"]}>
      <label htmlFor={id}>{label}</label>
      <input
        {...inputProps}
        aria-describedby={descriptionId}
        aria-invalid={error !== undefined}
        id={id}
      />
      <span id={descriptionId}>{error ?? helper}</span>
      {error === undefined ? null : <span role="alert">{error}</span>}
    </div>
  )
}
