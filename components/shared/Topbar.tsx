import Link from 'next/link';
import Image from 'next/image';

async function Topbar() {
  return (
    <nav className="topbar">
      <Link href="/" className="flex items-center gap-4">
        <Image src="/logo.svg" alt="Logo" width={28} height={28} />
        <p className="font-bold max-xs:hidden"> Metal Vault</p>
      </Link>

      <div className="flex items-center gap-1">
        <div className='ml-auto'>
          <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );  
}

export default Topbar;