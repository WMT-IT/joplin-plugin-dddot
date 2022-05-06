import JoplinRepo from "src/repo/joplinrepo";
import Link from "../../types/link";

export default class JoplinService {
    static Cancel = "Cancel";

    static OK = "OK";

    dialogHandle = "";

    repo: JoplinRepo;

    constructor(repo: JoplinRepo) {
        this.repo = repo;
    }

    async createNoteLink(noteId: string): Promise<Link> {
        const note = await this.repo.dataGet(["notes", noteId]);
        return Link.createNoteLink(noteId, note.title);
    }

    async searchBacklinks(id: string): Promise<Link[]> {
        let hasMore = true;
        let page = 1;
        let items = [];
        while (hasMore) {
            const notes = await this.repo.dataGet(["search"], { query: id, fields: ["id", "title"], page });
            items = items.concat(notes.items);
            if (notes.has_more) { page += 1; } else { hasMore = false; }
        }

        const links = items.map((item) => Link.createNoteLink(item.id, item.title));
        return links;
    }

    async showMessageBox(message: string) {
        if (this.dialogHandle === "") {
            this.dialogHandle = await this.repo.dialogCreate("dddot.joplinservice.messageBox");
        }

        await this.repo.dialogSetHtml(this.dialogHandle, `<h3>${message}</h3>`);

        await this.repo.dialogSetButtons(this.dialogHandle, [
            {
                id: "ok",
            },
            {
                id: "cancel",
            },
        ]);

        const result = await this.repo.dialogOpen(this.dialogHandle);

        return result.id === "ok" ? JoplinService.OK : JoplinService.Cancel;
    }
}
