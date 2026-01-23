import useGlobalStore from '@/app/stores/useGlobalStore';
import { QRCodeSVG } from 'qrcode.react';
import styles from "./styles.module.css"
import { useState } from 'react';

function QRCodeOverlay() {
    const qrCodeUrl = useGlobalStore(state => state.qrCodeUrl)
    const [copied, setCopied] = useState(false)
    return qrCodeUrl ?
        <div className={styles.qrcode}>
            <h1 className='text-2xl'>Scan the QR code below on your AR-compatible smart phone!</h1>
            <QRCodeSVG size={256} value={qrCodeUrl} />
            <h1 className={`${styles.copy} text-xl`} onClick={async () => {
                await navigator.clipboard.writeText(qrCodeUrl)
                setCopied(true)
                setTimeout(() => {
                    setCopied(false)
                }, 1000)
            }}>{copied ? "Copied!" : "Copy link"}</h1>
        </div>
        : null;
}

export default QRCodeOverlay;