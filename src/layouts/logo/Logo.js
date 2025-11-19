import Link from "next/link";

const Logo = ({ isOpen }) => {
  const src = isOpen ? "/images/logo-open.svg" : "/images/logo-closed.svg";
  return (
    <Link href="/processos" className="logo-wrap">
      <img src={src} alt="logo" />
    </Link>
  );
};

export default Logo;
