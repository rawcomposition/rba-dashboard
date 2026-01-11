import React from "react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import Icon from "components/Icon";

type Props = {
  regionCode?: string;
};

export default function ListDropdown({ regionCode }: Props) {
  const links = [
    {
      name: "Update Life List",
      href: `/import-lifelist?region=${regionCode}`,
      icon: "feather",
    },
  ];

  return (
    <Menu as="div" className="relative z-20 ml-auto">
      <Menu.Button className="flex items-center text-[14px] gap-2 font-medium justify-center rounded py-1 px-1 hover:bg-gray-200 text-gray-600">
        <Icon name="verticalDots" className="text-lg" />
      </Menu.Button>

      <Transition>
        <Transition.Child
          enter="transition duration-200 ease-out"
          enterFrom="scale-95 opacity-0"
          enterTo="scale-100 opacity-100"
          leave="transition duration-150 ease-in"
          leaveFrom="scale-100 opacity-100"
          leaveTo="scale-95 opacity-0"
          className="-right-2 top-8 absolute  z-50 min-w-[240px] origin-top-right ring-[0.5px] ring-gray-700/10 overflow-hidden rounded-lg bg-white text-gray-700 shadow-md py-2"
        >
          <Menu.Items>
            {links.map(({ name, href, icon }) => (
              <Menu.Item key={name}>
                {({ active }) => (
                  <Link
                    className="flex items-center gap-2 p-2 pl-4 text-[13px] text-gray-900 hover:bg-gray-50"
                    href={href}
                  >
                    <Icon name={icon as any} />
                    <span>{name}</span>
                  </Link>
                )}
              </Menu.Item>
            ))}
          </Menu.Items>
        </Transition.Child>
      </Transition>
    </Menu>
  );
}
