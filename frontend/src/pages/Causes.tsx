import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { causeColor, causeIcon } from "../lib/causeColors";

const GET_CAUSES = gql`
  query GetCausesForPicker {
    causes {
      tag
      label
      charityCount
    }
  }
`;

interface Cause {
  tag: string;
  label: string;
  charityCount: number;
}

export function Causes() {
  const navigate = useNavigate();
  const [pickerTags, setPickerTags] = useState<string[]>([]);

  const { data } = useQuery(GET_CAUSES);
  const causes: Cause[] = data?.causes ?? [];
  const activeCauses = causes.filter((c) => c.charityCount > 0);

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col px-4 py-16">
      <div className="w-full max-w-2xl mx-auto text-center flex-1">
        <h1 className="text-3xl font-bold text-text-primary mb-3">
          What causes matter most to you?
        </h1>
        <p className="text-text-secondary mb-10 text-lg">
          Find Denver nonprofits doing work you care about.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {activeCauses.map((cause) => {
            const isSelected = pickerTags.includes(cause.tag);
            return (
              <button
                key={cause.tag}
                type="button"
                onClick={() =>
                  setPickerTags((prev) =>
                    isSelected
                      ? prev.filter((t) => t !== cause.tag)
                      : [...prev, cause.tag],
                  )
                }
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all text-center ${
                  isSelected
                    ? "border-brand-secondary shadow-md"
                    : "border-brand-tertiary bg-bg-primary hover:border-brand-secondary hover:shadow-md"
                }`}
                style={
                  isSelected
                    ? { backgroundColor: `${causeColor([cause.tag])}10` }
                    : undefined
                }
              >
                <span
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform"
                  style={{
                    backgroundColor: `${causeColor([cause.tag])}${isSelected ? "30" : "18"}`,
                  }}
                >
                  {causeIcon([cause.tag])}
                </span>
                <span className="font-semibold text-text-primary">
                  {cause.label}
                </span>
                <span className="text-xs text-text-secondary">
                  {cause.charityCount}{" "}
                  {cause.charityCount === 1 ? "organization" : "organizations"}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => navigate("/organizations?tags=all")}
          className="mt-10 text-sm text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
        >
          Browse all organizations →
        </button>
      </div>

      {/* Sticky footer — appears once at least one cause is selected */}
      <div
        className={`fixed bottom-0 left-0 right-0 px-4 pb-6 pt-4 bg-bg-primary border-t border-brand-tertiary transition-all duration-300 ${
          pickerTags.length > 0
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={() => navigate(`/organizations?tags=${pickerTags.join(",")}`)}
          className="w-full max-w-sm mx-auto block py-3.5 rounded-full bg-brand-secondary text-white font-semibold text-sm"
        >
          See organizations →
        </button>
      </div>
    </div>
  );
}
