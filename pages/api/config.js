import modelCatalog from '../../utils/modelCatalog';

export default function handler(req, res) {
  return res.status(200).json({
    imageModels: modelCatalog.image.allowedModels,
    imageDefault: modelCatalog.image.defaultModel,
  });
}
