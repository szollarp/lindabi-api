import {
  BlobSASPermissions, BlobServiceClient, ContainerClient,
  StorageSharedKeyCredential, generateBlobSASQueryParameters
} from '@azure/storage-blob';

export type AzureServiceOps = {
  accountName: string;
  accountKey: string;
  containerName: string
  connectionString: string
};

export class AzureStorageService {
  private blobClient: BlobServiceClient;
  private containerClient: ContainerClient;
  private containerName: string;
  private accountName: string;
  private accountKey: string;

  constructor(ops: AzureServiceOps) {
    const { accountName, accountKey, containerName, connectionString } = ops;

    if (!connectionString || !containerName || !accountName || !accountKey) {
      throw new Error("Missing required Azure Storage configuration");
    }

    this.blobClient = BlobServiceClient.fromConnectionString(connectionString);
    this.containerClient = this.blobClient.getContainerClient(containerName);
    this.containerName = containerName;
    this.accountName = accountName;
    this.accountKey = accountKey;
  }

  public async uploadBlob(buffer: Buffer | Blob, blobName: string, mimeType: string): Promise<string> {
    const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(buffer, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return blockBlobClient.url;
  }

  public async removeBlob(blobName: string): Promise<void> {
    const blockBlobClient = this.containerClient.getBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
  };

  public generateSasUrl(blobName: string, expiresInHours = 1): string {
    const sharedKeyCredential = new StorageSharedKeyCredential(this.accountName, this.accountKey);

    const sasOptions = {
      containerName: this.containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(),
      expiresOn: new Date(new Date().valueOf() + expiresInHours * 60 * 60 * 1000),
    };

    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${blobName}?${sasToken}`;
  };

  public async downloadBlob(blobName: string): Promise<NodeJS.ReadableStream | undefined> {
    const blockBlobClient = this.containerClient.getBlobClient(blobName);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);

    if (!downloadBlockBlobResponse.readableStreamBody) {
      return;
    }

    return downloadBlockBlobResponse.readableStreamBody;
  }
};