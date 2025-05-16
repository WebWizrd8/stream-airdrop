import { Header } from "../component";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      { children }
    </div>
  );
};

export const withLayout =
  (Page: React.FC): React.FC =>
  () => {
    return (
      <Layout>
        <Page />
      </Layout>
    );
  };
