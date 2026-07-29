import Link from "next/link"
import { StatusChip } from "@/components/primitives"
import styles from "@/components/site-header.module.css"

type SiteHeaderProps = {
  readonly operator?: boolean
}

export function SiteHeader({ operator = false }: SiteHeaderProps) {
  return (
    <header className={styles["header"]}>
      <Link className={styles["brand"]} href="/">
        <span aria-hidden="true" className={styles["mark"]}>
          G
        </span>
        <span>GIWA LEARN</span>
      </Link>
      <nav aria-label="주요 메뉴" className={styles["nav"]}>
        <StatusChip>
          <span className={styles["wideMode"]}>
            {operator ? "OPERATOR · SAMPLE DATA" : "GASOK PROTOTYPE"}
          </span>
          <span className={styles["compactMode"]}>{operator ? "OPS · DEMO" : "PROTOTYPE"}</span>
        </StatusChip>
        <Link href={operator ? "/" : "/operator"}>{operator ? "참여자 화면" : "운영 콘솔"}</Link>
      </nav>
    </header>
  )
}
