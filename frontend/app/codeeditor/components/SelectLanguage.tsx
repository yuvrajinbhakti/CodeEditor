"use client";

import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { languageOptions } from "@/config/config";

export type selectedLanguageOptionProps = {
  language: string;
  version: string;
  aliases: string[];
  runtime?: string;
};


export default function SelectLanguages({
  onSelect,
  selectedLanguageOption,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSelect: any;
  selectedLanguageOption: selectedLanguageOptionProps;
}) {


  return (
    <Listbox value={selectedLanguageOption} onChange={onSelect}>
      <Label className="block text-sm/6 font-medium text-gray-900">
        Assigned to
      </Label>
      <div className="relative mt-2">
        <ListboxButton className="relative min-w-[150px] cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm">
          <span className="flex items-center">
            <span className="ml-3 block truncate capitalize">
              {selectedLanguageOption.language} ({selectedLanguageOption.version})
            </span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
            <ChevronUpDownIcon
              aria-hidden="true"
              className="h-5 w-5 text-gray-400"
            />
          </span>
        </ListboxButton>

        <ListboxOptions className="absolute z-10 mt-1 max-h-56 min-w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm">
          {languageOptions.map((item) => (
            <ListboxOption
              key={item.language}
              value={item}
              className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
            >
              <div className="flex items-center">
                <span className="ml-3 block truncate capitalize font-normal group-data-[selected]:font-semibold">
                  {item.language} ({item.version})
                </span>
              </div>

              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
                <CheckIcon aria-hidden="true" className="h-5 w-5" />
              </span>
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}
