import React, { forwardRef, useState, useEffect } from "react";
import { DateFormat, defaultDateFormat, getStringDateFormatFromDate } from "../../../../common/src/utils/dateManipulation";

export interface ClientCardProps {
  id: string;
  data?: Record<string, any>;
  onSelect: (client: any, id?: string) => void;
  placeholder?: string;
  dateFormat?: DateFormat;
}

export const ClientCard = forwardRef<HTMLDivElement, ClientCardProps>(({ id, data, placeholder, onSelect, dateFormat = defaultDateFormat }, ref) => {
  // Format the dates

  return (
    <div ref={ref} key={id} id={id} className="mb-4 rounded border p-4 shadow" onClick={() => onSelect(data, id)} style={{ cursor: "pointer" }}>
      {data && (
        <div className="items-between justify-between text-base">
          <div className="flex items-end gap-x-2">
            <h3 className="text-lg font-semibold">
              {data.prefix ? `${data.prefix} ` : ""}
              {data.firstName} {data.lastName}
            </h3>
            <p className="pb-[0.5px] text-secondary-dark">{data.pronouns}</p>
          </div>
          <p>Date of Birth: {getStringDateFormatFromDate(data.dateOfBirth, dateFormat)}</p>
          <p>Email: {data.email}</p>
          <p>Phone: {data.phone}</p>
          <p>Created: {getStringDateFormatFromDate(data.createdAt, dateFormat)}</p>
          <p>Last Updated: {getStringDateFormatFromDate(data.updatedAt, dateFormat)}</p>
          <p className="bottom-0 mt-1 flex justify-center self-center text-[12px] text-secondary-dark">ID: {data.id}</p>
        </div>
      )}
      {!data && placeholder && (
        <div className="flex h-full items-center justify-center">
          <p className="text-center text-lg text-secondary-dark">{placeholder}</p>
        </div>
      )}
    </div>
  );
});

ClientCard.displayName = "ClientCard";
