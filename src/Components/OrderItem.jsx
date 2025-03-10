import React from "react";
import { TableRow, TableCell } from "@mui/material";

const OrderItem = ({ order }) => {
  return (
    <TableRow>
      <TableCell>{order.id}</TableCell>
      <TableCell>
        {order.firstName} {order.lastName}
      </TableCell>
      <TableCell>{order.companyName}</TableCell>
      <TableCell>{order.email}</TableCell>
      <TableCell>{order.mobileNumber}</TableCell>
      <TableCell>{order.fieldOfWork}</TableCell>
      <TableCell>{Object.values(order.requiredSkills).join(", ")}</TableCell>
      <TableCell>{order.projectDescription}</TableCell>
      <TableCell>{order.additionalMessage}</TableCell>
      <TableCell>{order.fileAttachment}</TableCell>
    </TableRow>
  );
};

export default OrderItem;
