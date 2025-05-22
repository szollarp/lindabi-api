"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const workTypes = [
      "Roof hazard removal",
      "Roof replacement flat - bitumen",
      "Roof replacement flat - standing seam aluminum",
      "Roof replacement hip roof - tile",
      "Roof replacement hip roof - slate",
      "Roof replacement hip roof - tile sheet",
      "Roof replacement hip roof - shingle",
      "Roof replacement hip roof - trapezoidal sheet",
      "Roof replacement hip roof - standing seam aluminum cover",
      "Roof replacement hip roof - Gerard sheet covering",
      "Facade hazard removal",
      "Facade plastering / patch repair",
      "Facade repair + tiling on terrace",
      "Facade thermal insulation",
      "Facade thermal insulation + painting",
      "Tiling - hanging corridor",
      "Tiling - terrace",
      "Sheet metal work - downpipe replacement",
      "Sheet metal work - upper gutter replacement",
      "Sheet metal work - hanging gutter replacement",
      "Sheet metal work - pigeon spike installation",
      "Sheet metal work - bird netting installation",
      "Sprayed adhesive foam insulation on roof",
      "Waterproofing",
      "Chimney sweep path construction",
      "Terrace / balcony artificial stone repair - concrete",
      "Terrace / balcony artificial stone repair - XPS",
      "Terrace / balcony artificial stone repair - artificial stone",
      "Facade repair",
      "Lichthof wall renovation / hazard removal / canopy construction",
      "Office administration, obtaining permits",
      "Glass cleaning",
      "Graffiti removal",
      "Stone surface, facade cleaning",
      "Metal surface cleaning",
      "Installation, glass replacement, locksmith work",
      "Soffit replacement, painting",
      "Stucco restoration, replacement, repair",
      "Concreting, formwork, slab or staircase pouring",
      "Masonry",
      "Chimney construction, demolition",
      "Fence construction",
      "Apartment renovation",
      "Staircase painting, tiling",
      "Tree cutting",
      "Decoration, banner installation",
      "Pigeon removal, disinfection",
      "Panel joint insulation",
      "Industrial electrical work",
      "Preparing non-priced budget"
    ];

    const timestamp = new Date();

    await queryInterface.bulkInsert("work_types", workTypes.map(name => ({
      name,
      created_on: timestamp,
      updated_on: timestamp,
      tenant_id: 23
    })), {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("work_types", null, {});
  }
};