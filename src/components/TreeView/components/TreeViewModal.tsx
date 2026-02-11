import type { ReactNode } from "react";
import { Modal } from "akeneo-design-system";
import styled from "styled-components";

type TreeViewModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export const TreeViewModal = ({
  title,
  onClose,
  children,
}: TreeViewModalProps) => (
  <WideModal closeTitle="Close" onClose={onClose}>
    <ModalBody>
      <Modal.SectionTitle color="brand">Tree View</Modal.SectionTitle>
      <Modal.Title>{title}</Modal.Title>
      {children}
    </ModalBody>
  </WideModal>
);

const WideModal = styled(Modal)`
  min-width: 800px;
`;

const ModalBody = styled.div`
  width: 90%;
`;
