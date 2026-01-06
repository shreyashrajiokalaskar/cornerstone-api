import { DOC_STATUS, ISimilarSearch } from '@app/common';
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class VectorService {
  constructor(private datasource: DataSource) {}

  async similaritySearch(
    workspaceId: string,
    embedding: number[],
    limit = 5,
  ): Promise<ISimilarSearch[]> {
    const vector = `[${embedding.join(',')}]`;

    return await this.datasource.query(
      `
      SELECT
          dc.id,
          dc.content,
          d.name AS document_name,
          d.id AS document_id,
          1 - (dc.embedding <=> $2) AS similarity
        FROM document_chunks dc
        JOIN documents d ON dc."documentId" = d.id
        WHERE d."workspaceId" = $1
          AND d.status = $4
        ORDER BY dc.embedding <=> $2
        LIMIT $3
    `,
      [workspaceId, vector, limit, DOC_STATUS.COMPLETED],
    );
  }
}
