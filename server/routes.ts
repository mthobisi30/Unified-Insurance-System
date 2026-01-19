  app.get('/api/email-archives/search', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (!user?.currentTeamId) {
        return res.status(400).json({ message: "No team selected" });
      }
      
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const emails = await storage.searchEmailArchives(user.currentTeamId, query);
      res.json(emails);
    } catch (error) {
      console.error("Error searching email archives:", error);
      res.status(500).json({ message: "Failed to search email archives" });
    }
  });
