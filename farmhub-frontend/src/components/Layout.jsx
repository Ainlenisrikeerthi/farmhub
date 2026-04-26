import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="fh-container" style={{ paddingTop: "24px", paddingBottom: "40px" }}>
        {children}
      </main>
    </div>
  );
}

export default Layout;
