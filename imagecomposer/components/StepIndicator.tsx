import React from 'react';
import { WizardStep } from '../types';
import { WIZARD_STEPS } from '../constants';
import { CheckIcon } from './IconComponents';

interface StepIndicatorProps {
  currentStep: WizardStep;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {WIZARD_STEPS.map((step, stepIdx) => {
          const nameColorClass =
            step.id < currentStep
              ? 'text-gray-200'
              : step.id === currentStep
              ? 'text-nutshel-accent font-semibold'
              : 'text-gray-500';

          return (
            <li key={step.name} className={`relative ${stepIdx !== WIZARD_STEPS.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
              {step.id < currentStep ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-nutshel-accent" />
                  </div>
                  <span className="relative flex h-8 w-8 items-center justify-center bg-nutshel-accent rounded-full transition-colors">
                    <CheckIcon className="h-5 w-5 text-black" />
                  </span>
                </>
              ) : step.id === currentStep ? (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-white/10" />
                  </div>
                  <span
                    className="relative flex h-8 w-8 items-center justify-center bg-nutshel-gray-dark rounded-full border-2 border-nutshel-accent"
                    aria-current="step"
                  >
                    <span className="h-2.5 w-2.5 bg-nutshel-accent rounded-full" />
                  </span>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="h-0.5 w-full bg-white/10" />
                  </div>
                  <span className="relative flex h-8 w-8 items-center justify-center bg-nutshel-gray-dark rounded-full border-2 border-white/10 group-hover:border-gray-400">
                    <span className="h-2.5 w-2.5 bg-transparent rounded-full" />
                  </span>
                </>
              )}
              <span className={`absolute top-11 text-sm text-center w-24 -left-8 truncate ${nameColorClass}`}>{step.name}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};