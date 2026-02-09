import styles from "./styles.module.css"

function PresetCard({ presetName, previewImgSrc, inPreview, outPreview, onClick }: {
    previewImgSrc: string,
    inPreview: (e: React.MouseEvent) => void,
    outPreview: (e: React.MouseEvent) => void,
    onClick: (e: React.MouseEvent) => void,
    presetName: string
}) {
    if(!presetName) return <></>
    return (
        <div className={styles.presetContainer}>
            <img src={previewImgSrc} alt="preset preview" onMouseEnter={inPreview} onMouseLeave={outPreview} onClick={onClick}></img>
            <p>{presetName}</p>
        </div>
    );
}

export default PresetCard;