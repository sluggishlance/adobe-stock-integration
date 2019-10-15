<?php
/**
 * Copyright © Magento, Inc. All rights reserved.
 * See COPYING.txt for license details.
 */
declare(strict_types=1);

namespace Magento\AdobeMediaGallery\Model\Keyword\Command;

use Magento\AdobeMediaGalleryApi\Api\Data\KeywordInterface;
use Magento\AdobeMediaGalleryApi\Model\Keyword\Command\SaveAssetLinksInterface;
use Magento\Framework\App\ResourceConnection;
use Magento\Framework\DB\Adapter\AdapterInterface;
use Magento\Framework\Exception\CouldNotSaveException;

/**
 * Class SaveAssetLinks
 */
class SaveAssetLinks implements SaveAssetLinksInterface
{
    private const TABLE_ASSET_KEYWORD = 'adobe_media_gallery_asset_keyword';

    private const FIELD_ASSET_ID = 'asset_id';

    private const FIELD_KEYWORD_ID = 'keyword_id';

    /**
     * @var ResourceConnection
     */
    private $resourceConnection;

    /**
     * SaveAssetKeywords constructor.
     *
     * @param ResourceConnection $resourceConnection
     */
    public function __construct(
        ResourceConnection $resourceConnection
    ) {
        $this->resourceConnection = $resourceConnection;
    }

    /**
     * Save asset keywords links
     *
     * @param int $assetId
     * @param KeywordInterface[] $keywordIds
     *
     * @throws CouldNotSaveException
     */
    public function execute(int $assetId, array $keywordIds): void
    {
        try {
            $values = [];
            foreach ($keywordIds as $keywordId) {
                $data[] = $assetId;
                $data[] = $keywordId;
                array_push($values, $data);
                unset($data);
            }

            $connection = $this->resourceConnection->getConnection();
            $connection->insertArray(
                self::TABLE_ASSET_KEYWORD,
                [self::FIELD_ASSET_ID, self::FIELD_KEYWORD_ID],
                $values,
                AdapterInterface::INSERT_IGNORE
            );
        } catch(\Exception $exception) {
            $message = __('An error occurred during save asset keyword links: %1', $exception->getMessage());
            throw new CouldNotSaveException($message, $exception);
        }
    }
}
