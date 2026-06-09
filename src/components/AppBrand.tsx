const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

interface AppBrandProps {
  showHelp?: boolean;
  onHelpClick?: () => void;
}

export function AppBrand({ showHelp = false, onHelpClick }: AppBrandProps) {
  return (
    <div className="top-bar-title">
      <h1 className="app-brand">
        <img src={logoUrl} alt="Talk & Tap Reading" className="app-logo" />
      </h1>
      {showHelp && onHelpClick && (
        <button
          type="button"
          className="help-button"
          onClick={onHelpClick}
          aria-label="Help for parents and teachers"
        >
          ?
        </button>
      )}
    </div>
  );
}
