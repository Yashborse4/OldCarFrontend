import { gql } from '@apollo/client';

export const SEARCH_CARS_QUERY = gql`
  query SearchCars($input: CarSearchInput!) {
    searchCars(input: $input) {
      content {
        id
        brand
        model
        year
        price
        mileage
        city
        condition
        thumbnailUrl
        sellerType
        ownerName
        verifiedDealer
        views
        fuelType
        transmission
      }
      totalPages
      totalElements
      pageNumber
      pageSize
    }
  }
`;
