/**
 * Required External Modules and Interfaces
 */
import { Router, Request, Response } from "express";

import * as ItemService from "./items.service";
import { BaseItem, Item } from "./item.interface";
import { checkJwt } from "../middleware/authz.middleware";
import { checkPermissions } from "../middleware/permissions.middleware";
import { ItemPermission } from "./item-permission";

/**
 * Router Definition
 */

export const itemsRouter = Router();

/**
 * Controller Definitions
 */

// Public API endpoints

// GET items
itemsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const items: Item[] = await ItemService.findAll();
    res.status(200).send(items);
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

// GET items/:id
itemsRouter.get("/:id", async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);

  try {
    const item: Item = await ItemService.find(id);

    if (item) {
      return res.status(200).send(item);
    }

    res.status(404).send("item not found");
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

// Protected API endpoints
// Mount authorization middleware
itemsRouter.use(checkJwt);

// POST items
itemsRouter.post("/", checkPermissions(ItemPermission.createItems), async (req: Request, res: Response) => {
  try {
    const item: BaseItem = req.body;
    const newItem = await ItemService.create(item);

    res.status(201).json(newItem);
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

// PUT items/:id
itemsRouter.put("/:id", checkPermissions(ItemPermission.updateItems), async (req: Request, res: Response) => {
  const id: number = parseInt(req.params.id, 10);

  try {
    const itemUpdate: Item = req.body;
    const existingItem: Item = await ItemService.find(id);

    if (existingItem) {
      const updatedItem = await ItemService.update(id, itemUpdate);
      return res.status(200).json(updatedItem);
    }

    const newItem = await ItemService.create(itemUpdate);
    res.status(201).json(newItem);
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});

// DELETE items/:id
itemsRouter.delete("/:id", checkPermissions(ItemPermission.deleteItems), async (req: Request, res: Response) => {
  try {
    const id: number = parseInt(req.params.id, 10);
    await ItemService.remove(id);

    res.sendStatus(204);
  } catch (e: any) {
    res.status(500).send(e.message);
  }
});
