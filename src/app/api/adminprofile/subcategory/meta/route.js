import { NextResponse } from 'next/server';
import SubCategory from '@/models/SubCategory';
import connectdb from '@/lib/dbConnect';

function generateSlug(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
}

export async function PATCH(req) {
  await connectdb();

  try {
    const body = await req.json();
    const { id, name, metatitle, metadescription, metakeyword } = body;

    if (!id) {
      return NextResponse.json({ error: 'Subcategory ID is required' }, { status: 400 });
    }

    const updatedData = {
      ...(name && { name }),
      ...(name && { subcategoryslug: generateSlug(name) }), // 🔥 update slug too
      ...(metatitle && { metatitle }),
      ...(metadescription && { metadescription }),
      ...(metakeyword && { metakeyword }),
    };

    const updatedSubcategory = await SubCategory.findByIdAndUpdate(id, updatedData, { new: true });

    if (!updatedSubcategory) {
      return NextResponse.json({ error: 'Subcategory not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Subcategory updated', data: updatedSubcategory });
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
