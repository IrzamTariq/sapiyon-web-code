import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import StockTabContainer from "./../../components/customers/CustomerDetails/Tabs/StockTab";
import { TaskService } from "./../../services";
import { product } from "rambdax";

jest.mock("./../../services", () => {
  return {
    __esModule: true,
    TaskService: {
      find: jest.fn(),
    },
  };
});

beforeEach(() => {
  //   TaskService.find.clear();
});

describe("StockTabContainer", () => {
  it("should render without error", async () => {
    let response = [
      {
        _id: "5f5f1400d3857d78bc851100",
        unitPrice: 250,
        type: "service",
        tags: [],
        title: "Cleaning",
        description: "Periyodik soba bakım hizmeti",
      },
      {
        _id: "5f5f1400d3857d78bc851105",
        unitPrice: 75,
        type: "product",
        tags: ["Dezenfektan"],
        title: "Safe Guard",
        unitOfMeasurement: "Adet",
      },
    ];

    TaskService.find.mockImplementation(() => Promise.resolve(response));

    const { container } = render(<StockTabContainer customerId={"testId"} />);

    await waitFor(() => expect(TaskService.find).toHaveBeenCalled());
    await waitFor(() =>
      expect(TaskService.find).toHaveBeenCalledWith({
        query: { reportName: "SoldStockItems", customerId: "testId" },
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Products" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Services" }),
    ).toBeInTheDocument();

    // expect two tables
    let tables = container.querySelectorAll("table");
    expect(tables.length).toBe(2);
    let productRow = screen.getByText("Safe Guard").closest("table");
    expect(productRow).toBeInTheDocument();

    // if (productRow) {
    //   let productRowUtils = within(productRow);
    // }

    let serviceTable = screen.getByText("Cleaning").closest("table");
    expect(serviceTable).toBeInTheDocument();
  });
});
