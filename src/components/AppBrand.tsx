const logoUrl = `${import.meta.env.BASE_URL}logo.png`;

export function AppBrand() {
  return (
    <div className="top-bar-title">
      <h1 className="app-brand">
        <img src={logoUrl} alt="Talk & Tap Reading" className="app-logo" />
      </h1>
    </div>
  );
}
