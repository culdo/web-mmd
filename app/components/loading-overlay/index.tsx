function LoadingOverlay({ content = "" }) {
    return (
        <div id="overlay">
            <h1 id="loading">
                {content}
            </h1>
        </div>
    );
}

export default LoadingOverlay;