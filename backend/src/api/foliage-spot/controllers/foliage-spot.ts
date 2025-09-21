/**
 * foliage-spot controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::foliage-spot.foliage-spot",
  ({ strapi }) => ({
    /**
     * Create a new foliage spot with enhanced validation
     */
    async create(ctx) {
      const { data } = ctx.request.body;

      // Valid status values
      const validStatuses = [
        "green",
        "beginning",
        "colored",
        "peak",
        "fading",
        "finished",
      ];

      // Validate status if provided
      if (data.status && !validStatuses.includes(data.status)) {
        return ctx.badRequest(
          `Invalid status value. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      try {
        const entity = await strapi
          .documents("api::foliage-spot.foliage-spot")
          .create({
            data,
            populate: ["image"],
          });

        return this.transformResponse(entity);
      } catch (error) {
        strapi.log.error("Error creating foliage spot:", error);
        return ctx.badRequest("Failed to create foliage spot", {
          error: error.message,
        });
      }
    },

    /**
     * Update foliage spot with enhanced validation
     */
    async update(ctx) {
      const { id } = ctx.params;
      const { data } = ctx.request.body;

      // Valid status values
      const validStatuses = [
        "green",
        "beginning",
        "colored",
        "peak",
        "fading",
        "finished",
      ];

      // Validate status if provided
      if (data.status && !validStatuses.includes(data.status)) {
        return ctx.badRequest(
          `Invalid status value. Must be one of: ${validStatuses.join(", ")}`
        );
      }

      try {
        const entity = await strapi
          .documents("api::foliage-spot.foliage-spot")
          .update({
            documentId: id,
            data,
            populate: ["image"],
          });

        return this.transformResponse(entity);
      } catch (error) {
        strapi.log.error("Error updating foliage spot:", error);
        return ctx.badRequest("Failed to update foliage spot", {
          error: error.message,
        });
      }
    },
  })
);
