import React, { useState } from 'react';

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const SelectTrigger: React.FC<SelectTriggerProps> = ({ children, className = '' }) => (
  <div className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}>
    {children}
  </div>
);

const SelectContent: React.FC<SelectContentProps> = ({ children }) => (
  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
    <div className="py-1 max-h-60 overflow-auto">
      {children}
    </div>
  </div>
);

const SelectItem: React.FC<SelectItemProps> = ({ value, children, onClick }) => (
  <div 
    className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
    onClick={() => {
      if (onClick) {
        onClick();
      } else {
        const select = document.querySelector(`[data-value="${value}"]`);
        if (select) {
          select.setAttribute('data-selected', 'true');
          // Trigger change event
          const event = new Event('change', { bubbles: true });
          select.dispatchEvent(event);
        }
      }
    }}
  >
    {children}
  </div>
);

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const [displayValue, setDisplayValue] = React.useState<string>('');
  
  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-selected') {
          const selectedItems = document.querySelectorAll('[data-selected="true"]');
          if (selectedItems.length > 0) {
            setDisplayValue(selectedItems[selectedItems.length - 1].textContent || '');
          }
        }
      });
    });

    const selectContainer = document.querySelector('[data-select]');
    if (selectContainer) {
      observer.observe(selectContainer, {
        attributes: true,
        subtree: true,
        attributeFilter: ['data-selected']
      });
    }

    return () => observer.disconnect();
  }, []);

  return (
    <span className={displayValue ? 'text-gray-900' : 'text-gray-500'}>
      {displayValue || placeholder}
    </span>
  );
};

export const Select: React.FC<SelectProps> & {
  Trigger: typeof SelectTrigger;
  Content: typeof SelectContent;
  Item: typeof SelectItem;
  Value: typeof SelectValue;
} = ({ value, onValueChange, children, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" data-select data-value={value}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
      </div>
      {isOpen && (
        <div className="relative">
          <SelectContent>
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && child.type === SelectItem) {
                return React.cloneElement(child as React.ReactElement<SelectItemProps>, {
                  onClick: () => handleSelect((child.props as SelectItemProps).value)
                });
              }
              return child;
            })}
          </SelectContent>
        </div>
      )}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

Select.Trigger = SelectTrigger;
Select.Content = SelectContent;
Select.Item = SelectItem;
Select.Value = SelectValue;

// Export individual components
export { SelectTrigger, SelectContent, SelectItem, SelectValue };

export default Select;