import { gql } from '@apollo/client';

export const SEARCH_CARS_QUERY = gql`
  query SearchCars($input: CarSearchInput!) {
    searchCars(input: $input) {
      content {
        id
        brand
        model
        variant
        year
        price
        mileage
        city
        condition
        fuelType
        transmission
        verifiedDealer
        thumbnailUrl
        sellerType
        ownerName
        views
        createdAt
      }
      totalPages
      totalElements
      pageNumber
      pageSize
    }
  }
`;
