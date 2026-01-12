import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { MOCK_DATA_MODE } from '@/lib/env';

type NavItem = { name: string; href: string };

const NAV: NavItem[] = [
  { name: 'Dashboard', href: '/' },
  { name: 'Projects', href: '/projects' },
  { name: 'Governance', href: '/governance' },
  { name: 'Mentor', href: '/mentor' },
];

function isActivePath(currentPath: string, itemHref: string): boolean {
  if (itemHref === '/') return currentPath === '/';
  return currentPath.startsWith(itemHref);
}

export const OverlayNav = () => {
  const router = useRouter();
  const path = router.asPath.split('?')[0] ?? '/';

  return (
    <Disclosure as="nav" className="border-b border-gray-200 bg-white">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-14 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-emerald-50 text-emerald-700">
                    ⟲
                  </span>
                  <span className="font-semibold text-emerald-700">Regen Hub</span>
                  {MOCK_DATA_MODE ? (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                      Mock data
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="hidden md:flex md:items-center md:gap-1">
                {NAV.map((item) => {
                  const active = isActivePath(path, item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={clsx(
                        'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                        active
                          ? 'bg-emerald-50 text-emerald-800'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      )}
                      aria-current={active ? 'page' : undefined}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>

              <div className="flex items-center gap-2 md:hidden">
                <Disclosure.Button
                  className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  aria-label={open ? 'Close menu' : 'Open menu'}
                >
                  {open ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <Disclosure.Panel className="md:hidden">
            <div className="space-y-1 px-4 pb-3 pt-2">
              {NAV.map((item) => {
                const active = isActivePath(path, item.href);
                return (
                  <Disclosure.Button
                    key={item.href}
                    as={Link}
                    href={item.href}
                    className={clsx(
                      'block rounded-md px-3 py-2 text-base font-medium',
                      active
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                );
              })}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
