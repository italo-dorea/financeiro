import { Container, Flex, Heading, Image, Spacer } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <Container maxW="1200px" py={2}>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
      </Routes>
    </Container>
  );
}
