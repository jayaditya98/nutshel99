import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, id, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="mt-1">
        <input
          id={id}
          name={id}
          className="shadow-sm bg-nutshel-gray-dark border border-white/10 focus:ring-1 focus:ring-nutshel-accent focus:border-nutshel-accent block w-full sm:text-sm rounded-xl text-white px-3 py-3"
          {...props}
        />
      </div>
    </div>
  );
};

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, id, ...props }) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="mt-1">
        <textarea
          id={id}
          name={id}
          rows={4}
          className="shadow-sm bg-nutshel-gray-dark border border-white/10 focus:ring-1 focus:ring-nutshel-accent focus:border-nutshel-accent block w-full sm:text-sm rounded-xl text-white px-3 py-3"
          {...props}
        />
      </div>
    </div>
  );
};
