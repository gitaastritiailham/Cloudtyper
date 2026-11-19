import styles from './CharacterPanel.module.css'

type Props = {
  imageSrc?: string // 画像ができたらここに渡す（VRoid の書き出し PNG など）
}

export function CharacterPanel({ imageSrc }: Props) {
  return (
    <aside className={styles.panel}>
      {imageSrc ? (
        <img className={styles.image} src={imageSrc} alt="キャラクター" />
      ) : (
        <div className={styles.placeholder}>キャラクター</div>
      )}
    </aside>
  )
}
