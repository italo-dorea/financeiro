/**
 * Mock leve do @chakra-ui/react para testes unitários/integração.
 * Substitui todos os componentes pesados (que usam @emotion/react) por
 * elementos HTML simples, evitando hangs no jsdom.
 *
 * Componentes são mapeados para equivalentes semânticos mantenendo os
 * data-testid e aria-* attributes para que os testes RTL funcionem.
 */
import React from "react";
import { vi } from "vitest";

type BoxProps = React.HTMLAttributes<HTMLElement> & { as?: string; [key: string]: any };

const passThrough =
  (tag: string, testId?: string) =>
  ({ children, as: _as, sx: _sx, ...props }: BoxProps) =>
    React.createElement(tag, { "data-testid": testId, ...props }, children);

// Layout
export const Box = passThrough("div");
export const Flex = passThrough("div", "flex");
export const Stack = passThrough("div");
export const HStack = passThrough("div");
export const VStack = passThrough("div");
export const Grid = passThrough("div");
export const GridItem = passThrough("div");
export const Container = passThrough("div");
export const Center = passThrough("div");
export const SimpleGrid = passThrough("div");

// Typography
export const Text = passThrough("p");
export const Heading = passThrough("h2");

// Forms
export const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) =>
  React.createElement("input", props);
export const Select = ({
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { children?: React.ReactNode }) =>
  React.createElement("select", props, children);
export const Checkbox = ({
  children,
  isChecked,
  onChange,
  ...props
}: BoxProps & { isChecked?: boolean; onChange?: (e: any) => void }) =>
  React.createElement(
    "label",
    null,
    React.createElement("input", { type: "checkbox", checked: isChecked, onChange }),
    children
  );
export const FormControl = passThrough("div");
export const FormLabel = passThrough("label");
export const FormErrorMessage = passThrough("span");
export const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) =>
  React.createElement("textarea", props);
export const Switch = ({
  isChecked,
  onChange,
}: {
  isChecked?: boolean;
  onChange?: (e: any) => void;
}) =>
  React.createElement("input", {
    type: "checkbox",
    role: "switch",
    checked: isChecked,
    onChange,
  });

// Buttons & Actions
export const Button = ({
  children,
  isLoading,
  isDisabled,
  onClick,
  type,
  ...props
}: BoxProps & {
  isLoading?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  type?: string;
}) =>
  React.createElement(
    "button",
    { onClick, disabled: isDisabled || isLoading, type, ...props },
    isLoading ? "Loading..." : children
  );
export const IconButton = ({ "aria-label": label, onClick }: any) =>
  React.createElement("button", { onClick, "aria-label": label });

// Feedback
export const Spinner = ({ size: _size, ...props }: any) =>
  React.createElement("div", { role: "status", "data-testid": "loading-spinner", ...props });
export const Alert = passThrough("div");
export const AlertIcon = () => null;
export const AlertTitle = passThrough("strong");
export const AlertDescription = passThrough("span");
export const Badge = passThrough("span");
export const Tooltip = ({ children }: BoxProps) => React.createElement(React.Fragment, null, children);
export const Progress = () => React.createElement("div", { role: "progressbar" });

// Overlay
export const Modal = ({ isOpen, children }: { isOpen?: boolean; children?: React.ReactNode }) =>
  isOpen ? React.createElement("div", { role: "dialog" }, children) : null;
export const ModalOverlay = () => null;
export const ModalContent = passThrough("div");
export const ModalHeader = passThrough("header");
export const ModalBody = passThrough("div");
export const ModalFooter = passThrough("footer");
export const ModalCloseButton = () =>
  React.createElement("button", { "aria-label": "Close" }, "×");
export const Drawer = Modal;
export const DrawerOverlay = () => null;
export const DrawerContent = passThrough("div");
export const DrawerHeader = passThrough("header");
export const DrawerBody = passThrough("div");
export const DrawerFooter = passThrough("footer");
export const DrawerCloseButton = ModalCloseButton;

// Navigation
export const Menu = passThrough("div");
export const MenuButton = passThrough("button");
export const MenuList = passThrough("ul");
export const MenuItem = passThrough("li");
export const MenuDivider = () => React.createElement("hr");
export const Tabs = passThrough("div");
export const Tab = passThrough("button");
export const TabList = passThrough("div");
export const TabPanels = passThrough("div");
export const TabPanel = passThrough("div");

// Data Display
export const Table = passThrough("table");
export const Thead = passThrough("thead");
export const Tbody = passThrough("tbody");
export const Tr = passThrough("tr");
export const Th = passThrough("th");
export const Td = passThrough("td");
export const Tag = passThrough("span");
export const TagLabel = passThrough("span");
export const TagCloseButton = () => React.createElement("button");
export const Divider = () => React.createElement("hr");

// Utils / other
export const ChakraProvider = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
export const useToast = () => vi.fn();
export const useDisclosure = (defaultOpen = false) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen((v) => !v),
  };
};
export const useColorMode = () => ({ colorMode: "light", toggleColorMode: vi.fn() });
export const useColorModeValue = (light: unknown, _dark: unknown) => light;
export const extendTheme = (theme: any) => theme;
export const createStandaloneToast = () => ({ toast: vi.fn() });
export const NumberInput = passThrough("div");
export const NumberInputField = (props: any) => React.createElement("input", { type: "number", ...props });
export const NumberInputStepper = passThrough("div");
export const NumberIncrementStepper = () => React.createElement("button");
export const NumberDecrementStepper = () => React.createElement("button");
export const InputGroup = passThrough("div");
export const InputLeftAddon = passThrough("span");
export const InputRightAddon = passThrough("span");
export const InputLeftElement = passThrough("span");
export const InputRightElement = passThrough("span");
export const Popover = ({ children }: BoxProps) => React.createElement(React.Fragment, null, children);
export const PopoverTrigger = ({ children }: BoxProps) => React.createElement(React.Fragment, null, children);
export const PopoverContent = passThrough("div");
export const PopoverBody = passThrough("div");
export const PopoverArrow = () => null;
export const PopoverCloseButton = ModalCloseButton;
export const Collapse = ({ children, in: isOpen }: { children?: React.ReactNode; in?: boolean }) =>
  isOpen ? React.createElement(React.Fragment, null, children) : null;
export const Accordion = passThrough("div");
export const AccordionItem = passThrough("div");
export const AccordionButton = passThrough("button");
export const AccordionPanel = passThrough("div");
export const AccordionIcon = () => null;
export const Stat = passThrough("div");
export const StatLabel = passThrough("span");
export const StatNumber = passThrough("span");
export const StatHelpText = passThrough("span");
export const Icon = () => null;
export const Image = (props: React.ImgHTMLAttributes<HTMLImageElement>) =>
  React.createElement("img", props);
export const Avatar = ({ name }: { name?: string }) =>
  React.createElement("div", { "aria-label": name });
