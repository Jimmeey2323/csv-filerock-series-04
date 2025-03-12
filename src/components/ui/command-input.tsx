
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Clock, Search, X } from 'lucide-react';
import { getSearchHistory, addToSearchHistory } from '@/utils/csvParser';

interface CommandSearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const CommandSearchInput: React.FC<CommandSearchInputProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, [open]);

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    addToSearchHistory(selectedValue);
    setOpen(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value) {
      addToSearchHistory(value);
      setOpen(false);
      if (inputRef.current) {
        inputRef.current.blur();
      }
    }
  };

  const clearInput = () => {
    onChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <Popover open={open && (inputFocused || history.length > 0)} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={inputRef}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onFocus={() => {
                setInputFocused(true);
                setOpen(true);
              }}
              onBlur={() => {
                setInputFocused(false);
                // Delay closing to allow selection
                setTimeout(() => {
                  if (!inputRef.current?.contains(document.activeElement)) {
                    setOpen(false);
                  }
                }, 200);
              }}
              onKeyDown={handleKeyDown}
              className={`pl-9 pr-8 ${value ? 'border-primary' : ''}`}
            />
            {value && (
              <button
                onClick={clearInput}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-[300px] md:w-[400px]" side="bottom" align="start">
          <Command>
            <CommandList>
              {history.length > 0 && (
                <CommandGroup heading="Recent Searches">
                  {history.map((item, index) => (
                    <CommandItem
                      key={`${item}-${index}`}
                      onSelect={() => handleSelect(item)}
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{item}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {value && (
                <CommandEmpty>No results found. Press Enter to search.</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CommandSearchInput;
